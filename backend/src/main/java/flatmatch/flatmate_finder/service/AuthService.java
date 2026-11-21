
package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.entity.EmailVerificationToken;
import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.repository.EmailVerificationTokenRepository;
import flatmatch.flatmate_finder.repository.UserRepository;
import flatmatch.flatmate_finder.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailVerificationTokenRepository tokenRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailVerificationTokenRepository tokenRepository,
            EmailService emailService,
            OtpService otpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService= emailService;
        this.tokenRepository = tokenRepository;
        this.otpService = otpService;
    }

    @Value("${app.otp.expiry-minutes:10}")
    private long expiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private long cooldownSeconds;

    @Transactional
    public String register(String email, String password) {

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user != null && user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String hash = passwordEncoder.encode(password);
        if (user == null) {
            user = User.builder().email(email).passwordHash(hash).build();
        } else {
            // registered earlier but never verified: allow retrying with a new password
            user.setPasswordHash(hash);
        }
        user = userRepository.save(user);

        issueOtp(user);
        return "A verification code was sent to " + email + ". It expires in " + expiryMinutes + " minutes.";
    }

    // wrong guesses must be saved, so a thrown ResponseStatusException must NOT roll back
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public String verifyOtp(String email, String otp) {

        // same message for unknown email and wrong code, so emails can't be enumerated
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> bad("Invalid or expired code"));

        if (user.isEmailVerified()) {
            return "Email already verified. You can log in.";
        }

        EmailVerificationToken token = tokenRepository
                .findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> bad("Invalid or expired code"));

        if (!token.isUsable()) {
            throw bad("Invalid or expired code");
        }
        if (token.getAttempts() >= maxAttempts) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong attempts. Request a new code.");
        }

        if (!otpService.matches(email, otp, token.getTokenHash())) {
            token.setAttempts((short) (token.getAttempts() + 1));
            tokenRepository.save(token);
            throw bad("Invalid or expired code");
        }

        token.setUsedAt(Instant.now());
        user.setEmailVerified(true);
        return "Email verified. You can now log in.";
    }

    @Transactional
    public String resendOtp(String email) {
        userRepository.findByEmailIgnoreCase(email)
                .filter(u -> !u.isEmailVerified())
                .ifPresent(this::issueOtp);
        // same reply whether or not the email exists
        return "If this email is registered and not yet verified, a new code has been sent.";
    }

    private void issueOtp(User user) {
        tokenRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).ifPresent(last -> {
            if (last.getCreatedAt().plusSeconds(cooldownSeconds).isAfter(Instant.now())) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait before requesting another code.");
            }
        });

        tokenRepository.deleteByUserId(user.getId()); // only the newest code is valid

        String otp = otpService.generate();
        tokenRepository.save(EmailVerificationToken.builder()
                .user(user)
                .tokenHash(otpService.hash(user.getEmail(), otp))
                .expiresAt(Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES))
                .build());

        emailService.sendOtp(user.getEmail(), otp, expiryMinutes);
    }



    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    @Transactional
    public String login(String email, String password) {

        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Please verify your email first. Use resend-otp if your code expired.");
        }

        // Generate JWT after successful authentication
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(email)
                .password("")
                .authorities("ROLE_USER")
                .build();

        user.setLastActiveAt(Instant.now());
        return jwtService.generateToken(userDetails);
    }
}

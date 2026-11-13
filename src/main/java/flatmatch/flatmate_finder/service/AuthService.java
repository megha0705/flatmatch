
package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.repository.UserRepository;
import flatmatch.flatmate_finder.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public String register( String email, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));

        userRepository.save(user);

        return "User registered successfully";
    }

    public String login(String email, String password) {

        // Authenticate user credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        // Generate JWT after successful authentication
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(email)
                .password("")
                .authorities("ROLE_USER")
                .build();

        return jwtService.generateToken(userDetails);
    }
}

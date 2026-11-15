package flatmatch.flatmate_finder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendOtp(String to, String otp, long expiryMinutes) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Your FlatMatch verification code");
        msg.setText("Your verification code is " + otp + ".\n\n"
                + "It expires in " + expiryMinutes + " minutes. "
                + "If you did not sign up, ignore this email.");
        mailSender.send(msg);
    }
}

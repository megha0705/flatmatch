package flatmatch.flatmate_finder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();
    private final byte[] secret;

    public OtpService(@Value("${app.otp.secret}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    /** Six digits, zero-padded, from a cryptographically secure source. */
    public String generate() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    public String hash(String email, String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] out = mac.doFinal((email + ":" + otp).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash OTP", e);
        }
    }

    /** Constant-time comparison. */
    public boolean matches(String email, String otp, String storedHash) {
        return MessageDigest.isEqual(
                hash(email, otp).getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8));
    }
}
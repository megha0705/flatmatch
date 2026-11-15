
package flatmatch.flatmate_finder.controller;

import flatmatch.flatmate_finder.dto.MessageResponse;
import flatmatch.flatmate_finder.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestParam String email,
            @RequestParam String password) {

        String response = authService.register( email, password);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestParam String email,
            @RequestParam String password) {

        String token = authService.login(email, password);

        return ResponseEntity.ok(token);
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@RequestParam String email , @RequestParam String otp) {
        return ResponseEntity.ok(new MessageResponse(authService.verifyOtp(email, otp)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@RequestParam String email ) {
        return ResponseEntity.ok(new MessageResponse(authService.resendOtp(email)));
    }
}

package flatmatch.flatmate_finder.controller;

import flatmatch.flatmate_finder.dto.PreferencesRequest;
import flatmatch.flatmate_finder.dto.PreferencesResponse;
import flatmatch.flatmate_finder.service.PreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class PreferencesController {

    private final PreferencesService preferencesService;

    @GetMapping("/me")
    public PreferencesResponse getMine(Authentication auth) {
        return preferencesService.getMine(auth.getName());
    }

    @PutMapping("/me")
    public PreferencesResponse save(@Valid @RequestBody PreferencesRequest request,
                                    Authentication auth) {
        return preferencesService.save(auth.getName(), request);
    }
}
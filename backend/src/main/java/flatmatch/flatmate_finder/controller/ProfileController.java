package flatmatch.flatmate_finder.controller;

import flatmatch.flatmate_finder.dto.ProfileRequest;
import flatmatch.flatmate_finder.dto.ProfileResponse;
import flatmatch.flatmate_finder.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ProfileResponse getMine(Authentication auth) {
        return profileService.getMine(auth.getName());
    }

    @PutMapping("/me")
    public ProfileResponse save(@Valid @RequestBody ProfileRequest request, Authentication auth) {
        return profileService.save(auth.getName(), request);
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileResponse uploadPhoto(@RequestPart("photo") MultipartFile photo, Authentication auth) {
        return profileService.uploadPhoto(auth.getName(), photo);
    }

    @DeleteMapping("/me/photo")
    public ProfileResponse deletePhoto(Authentication auth) {
        return profileService.deletePhoto(auth.getName());
    }


}
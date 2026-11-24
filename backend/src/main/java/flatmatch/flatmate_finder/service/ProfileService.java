package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.dto.ProfileRequest;
import flatmatch.flatmate_finder.dto.ProfileResponse;
import flatmatch.flatmate_finder.dto.StoredImage;
import flatmatch.flatmate_finder.entity.Profile;
import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.entity.enums.UserStatus;
import flatmatch.flatmate_finder.repository.BlockRepository;
import flatmatch.flatmate_finder.repository.ProfileRepository;
import flatmatch.flatmate_finder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final String PHOTO_FOLDER = "flatmate/profiles";

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final BlockRepository blockRepository;
    private final ImageStorageService images;

    // ---------- read ----------

    @Transactional(readOnly = true)
    public ProfileResponse getMine(String email) {
        User me = currentUser(email);
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(ProfileService::notFound);
        return toResponse(profile, me);
    }


    // ---------- create / update ----------

    @Transactional
    public ProfileResponse save(String email, ProfileRequest req) {
        User me = currentUser(email);
        if ((req.getWorkLat() == null) != (req.getWorkLng() == null)) {
            throw bad("Provide both workLat and workLng, or neither");
        }

        Profile profile = profileRepository.findById(me.getId())
                .orElseGet(() -> Profile.builder().user(me).build());

        profile.setName(req.getName().trim());
        profile.setAge(req.getAge());
        profile.setGender(req.getGender());
        profile.setCity(req.getCity().trim());
        profile.setOccupation(req.getOccupation());
        profile.setOrganization(blankToNull(req.getOrganization()));
        profile.setBio(blankToNull(req.getBio()));
        profile.setWorkLabel(blankToNull(req.getWorkLabel()));
        // rounded to 2 decimals (about 1 km) so an exact workplace is never stored
        profile.setWorkLat(round(req.getWorkLat()));
        profile.setWorkLng(round(req.getWorkLng()));

        profile = profileRepository.save(profile);
        return toResponse(profile, me);
    }

    // ---------- photo ----------

    @Transactional
    public ProfileResponse uploadPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw bad("No photo provided");
        }
        User me = currentUser(email);
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> bad("Create your profile before adding a photo"));

        StoredImage stored = images.uploadAll(List.of(file), PHOTO_FOLDER).get(0);

        // if the database transaction fails, remove the image we just uploaded
        String newPublicId = stored.getPublicId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    images.deleteQuietly(Collections.singletonList(newPublicId));
                }
            }
        });

        String oldPublicId = profile.getPhotoPublicId();
        profile.setPhotoUrl(stored.getUrl());
        profile.setPhotoPublicId(stored.getPublicId());
        // the old image is removed only after the new one is safely saved
        runAfterCommit(() -> images.deleteQuietly(Collections.singletonList(oldPublicId)));

        return toResponse(profile, me);
    }

    @Transactional
    public ProfileResponse deletePhoto(String email) {
        User me = currentUser(email);
        Profile profile = profileRepository.findById(me.getId()).orElseThrow(ProfileService::notFound);

        String oldPublicId = profile.getPhotoPublicId();
        profile.setPhotoUrl(null);
        profile.setPhotoPublicId(null);
        runAfterCommit(() -> images.deleteQuietly(Collections.singletonList(oldPublicId)));

        return toResponse(profile, me);
    }

    // ---------- helpers ----------

    private User currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
    }

    private ProfileResponse toResponse(Profile p, User user) {
        return ProfileResponse.builder()
                .userId(p.getUserId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .city(p.getCity())
                .occupation(p.getOccupation())
                .organization(p.getOrganization())
                .bio(p.getBio())
                .photoUrl(p.getPhotoUrl())
                .workLabel(p.getWorkLabel())
                .workLat(p.getWorkLat())
                .workLng(p.getWorkLng())
                .emailVerified(user.isEmailVerified())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private static void runAfterCommit(Runnable task) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                task.run();
            }
        });
    }

    private static Double round(Double v) {
        return v == null ? null : Math.round(v * 100.0) / 100.0;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
    }
}
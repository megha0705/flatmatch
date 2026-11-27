package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.dto.PreferencesRequest;
import flatmatch.flatmate_finder.dto.PreferencesResponse;
import flatmatch.flatmate_finder.entity.Preferences;
import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.entity.enums.GenderPreference;
import flatmatch.flatmate_finder.repository.PreferencesRepository;
import flatmatch.flatmate_finder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreferencesService {

    // the only fields that can be marked as a deal-breaker
    // (budget is handled by range overlap in the matching engine, not as a hard filter)
    private static final Set<String> ALLOWED_DEAL_BREAKERS = Set.of(
            "sleepSchedule", "cleanliness", "noiseLevel", "diet",
            "smoking", "drinking", "guests", "workMode");

    private final UserRepository userRepository;
    private final PreferencesRepository preferencesRepository;

    // ---------- read ----------

    @Transactional(readOnly = true)
    public PreferencesResponse getMine(String email) {
        User me = currentUser(email);
        Preferences prefs = preferencesRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Preferences not set yet"));
        return toResponse(prefs);
    }

    // ---------- create / update ----------

    @Transactional
    public PreferencesResponse save(String email, PreferencesRequest req) {
        User me = currentUser(email);

        if (req.getBudgetMax() < req.getBudgetMin()) {
            throw bad("budgetMax cannot be less than budgetMin");
        }
        if (req.getMoveInDate() != null
                && req.getMoveInDate().isBefore(LocalDate.now(ZoneId.of("Asia/Kolkata")))) {
            throw bad("moveInDate cannot be in the past");
        }
        List<String> dealBreakers = cleanDealBreakers(req.getDealBreakers());

        // first save creates the row, later saves update it
        Preferences prefs = preferencesRepository.findById(me.getId())
                .orElseGet(() -> Preferences.builder().user(me).build());

        prefs.setLookingFor(req.getLookingFor());
        prefs.setSleepSchedule(req.getSleepSchedule());
        prefs.setCleanliness(req.getCleanliness());
        prefs.setNoiseLevel(req.getNoiseLevel());
        prefs.setDiet(req.getDiet());
        prefs.setSmoking(req.getSmoking());
        prefs.setDrinking(req.getDrinking());
        prefs.setGuests(req.getGuests());
        prefs.setWorkMode(req.getWorkMode());
        prefs.setBudgetMin(req.getBudgetMin());
        prefs.setBudgetMax(req.getBudgetMax());
        prefs.setGenderPreference(
                req.getGenderPreference() != null ? req.getGenderPreference() : GenderPreference.ANY);
        prefs.setMoveInDate(req.getMoveInDate());
        prefs.setDealBreakers(dealBreakers);

        prefs = preferencesRepository.save(prefs);
        return toResponse(prefs);
    }

    // ---------- helpers ----------

    private List<String> cleanDealBreakers(List<String> raw) {
        if (raw == null) {
            return new ArrayList<>();
        }
        List<String> cleaned = raw.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .distinct()
                .collect(Collectors.toList());

        for (String field : cleaned) {
            if (!ALLOWED_DEAL_BREAKERS.contains(field)) {
                throw bad("Unknown deal-breaker '" + field + "'. Allowed: "
                        + ALLOWED_DEAL_BREAKERS.stream().sorted().collect(Collectors.joining(", ")));
            }
        }
        return new ArrayList<>(cleaned);
    }

    private User currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
    }

    private PreferencesResponse toResponse(Preferences p) {
        return PreferencesResponse.builder()
                .lookingFor(p.getLookingFor())
                .sleepSchedule(p.getSleepSchedule())
                .cleanliness(p.getCleanliness())
                .noiseLevel(p.getNoiseLevel())
                .diet(p.getDiet())
                .smoking(p.getSmoking())
                .drinking(p.getDrinking())
                .guests(p.getGuests())
                .workMode(p.getWorkMode())
                .budgetMin(p.getBudgetMin())
                .budgetMax(p.getBudgetMax())
                .genderPreference(p.getGenderPreference())
                .moveInDate(p.getMoveInDate())
                .dealBreakers(List.copyOf(p.getDealBreakers()))
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.*;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PreferencesResponse {

    private final LookingFor lookingFor;
    private final SleepSchedule sleepSchedule;
    private final Short cleanliness;
    private final Short noiseLevel;
    private final Diet diet;
    private final SubstanceUse smoking;
    private final SubstanceUse drinking;
    private final GuestPolicy guests;
    private final WorkMode workMode;
    private final Integer budgetMin;
    private final Integer budgetMax;
    private final GenderPreference genderPreference;
    private final LocalDate moveInDate;
    private final List<String> dealBreakers;
    private final Instant updatedAt;
}
package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PreferencesRequest {

    @NotNull
    private LookingFor lookingFor;

    @NotNull
    private SleepSchedule sleepSchedule;

    @NotNull
    @Min(1)
    @Max(5)
    private Short cleanliness;

    @NotNull
    @Min(1)
    @Max(5)
    private Short noiseLevel;

    @NotNull
    private Diet diet;

    @NotNull
    private SubstanceUse smoking;

    @NotNull
    private SubstanceUse drinking;

    @NotNull
    private GuestPolicy guests;

    @NotNull
    private WorkMode workMode;

    // monthly budget in INR
    @NotNull
    @Min(0)
    @Max(1_000_000)
    private Integer budgetMin;

    @NotNull
    @Min(0)
    @Max(1_000_000)
    private Integer budgetMax;

    // optional, defaults to ANY
    private GenderPreference genderPreference;

    private LocalDate moveInDate;

    // field names the user treats as hard filters, e.g. ["smoking", "diet"]
    @Size(max = 8)
    private List<String> dealBreakers;
}
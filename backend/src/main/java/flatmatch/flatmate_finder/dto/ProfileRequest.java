package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.Gender;
import flatmatch.flatmate_finder.entity.enums.Occupation;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;

import static jakarta.persistence.EnumType.STRING;
@AllArgsConstructor
@Getter
public class ProfileRequest {
    @NotBlank
    @Size(max = 80)
    private String name;

    @NotNull
    @Min(18)
    @Max(100)
    private Short age;

    @NotNull
    private Gender gender;

    @NotBlank
    @Size(max = 80)
    private String city;

    @NotNull
    private Occupation occupation;

    // college or company name
    @Size(max = 120)
    private String organization;

    @Size(max = 1000)
    private String bio;

    // optional workplace, used later for commute-aware matching
    @Size(max = 120)
    private String workLabel;

    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double workLat;

    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double workLng;
}

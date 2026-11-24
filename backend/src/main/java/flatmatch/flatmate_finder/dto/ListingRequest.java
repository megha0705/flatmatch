package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
@Getter
@AllArgsConstructor
public class  ListingRequest {
    @NotBlank @Size(max = 120) String title;
    @Size(max = 2000) String description;
    @NotBlank @Size(max = 80) String city;
    @NotBlank @Size(max = 120) String locality;
    @Size(max = 200) String addressHint;
    @DecimalMin("-90.0") @DecimalMax("90.0") Double lat;
    @DecimalMin("-180.0") @DecimalMax("180.0") Double lng;
    @NotNull @Min(1) @Max(1_000_000) Integer rentPerPerson;
    @Min(0) @Max(10_000_000) Integer deposit;
    @NotNull RoomType roomType;
    Furnishing furnishing;
    ListingGender genderAllowed;
    @Min(0) @Max(20) Short currentFlatmates;
    @Min(1) @Max(20) Short spotsAvailable;
    @Size(max = 20) List<@NotBlank @Size(max = 40) String> amenities;
    @NotNull LocalDate availableFrom;
}
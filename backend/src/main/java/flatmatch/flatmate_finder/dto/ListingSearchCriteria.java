package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.Furnishing;
import flatmatch.flatmate_finder.entity.enums.ListingGender;
import flatmatch.flatmate_finder.entity.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
@Data
public class ListingSearchCriteria {

    private String city;
    private String locality;
    private Integer minRent;
    private Integer maxRent;
    private RoomType roomType;
    private Furnishing furnishing;
    private ListingGender genderAllowed;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate availableBy;
}


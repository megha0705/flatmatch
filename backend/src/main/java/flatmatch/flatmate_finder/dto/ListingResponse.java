package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ListingResponse{
        UUID id;
        String title;
        String description;
        String city;
        String locality;
        String addressHint;
        Double lat;
        Double lng;
        Integer rentPerPerson;
        Integer deposit;
        RoomType roomType;
        Furnishing furnishing;
        ListingGender genderAllowed;
        Short currentFlatmates;
        Short spotsAvailable;
        List<String> amenities;
        LocalDate availableFrom;
        ListingStatus status;
        List<PhotoSummary> photos;
        OwnerSummary owner;
        boolean ownedByMe;
        Instant createdAt;
}

    // never expose the owner's email

package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.Occupation;
import flatmatch.flatmate_finder.entity.enums.RoomType;
import flatmatch.flatmate_finder.matching.MatchBand;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class MatchListingSummery {
    private final UUID id;
    private final String title;
    private final String locality;
    private final Integer rentPerPerson;
    private final RoomType roomType;
    private final LocalDate availableFrom;
    private final Short spotsAvailable;
    private final String photoUrl;

}
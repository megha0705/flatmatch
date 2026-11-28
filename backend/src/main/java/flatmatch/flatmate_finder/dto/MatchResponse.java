package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.Occupation;
import flatmatch.flatmate_finder.matching.MatchBand;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class MatchResponse {

    // the host
    private final UUID userId;
    private final String name;
    private final Short age;
    private final Occupation occupation;
    private final String organization;
    private final String photoUrl;
    private final boolean emailVerified;

    // the match
    private final int score;
    private final MatchBand band;
    private final List<String> highlights;
    private final List<String> warnings;
    private final List<MatchFactorResponse> factors;

    // the room the seeker would actually take
    private final MatchListingSummary listing;
}
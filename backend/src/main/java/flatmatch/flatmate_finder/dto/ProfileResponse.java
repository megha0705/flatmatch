package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.enums.Gender;
import flatmatch.flatmate_finder.entity.enums.Occupation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@AllArgsConstructor
@Getter
@Builder
public class ProfileResponse {
    private  UUID userId;
    private String name;
    private Short age;
    private  Gender gender;
    private String city;
    private Occupation occupation;
    private String organization;
    private String bio;
    private String photoUrl;
    private String workLabel;
    private Double workLat;
    private Double workLng;
    private  boolean emailVerified;
    private  Instant createdAt;
    private  Instant updatedAt;
}

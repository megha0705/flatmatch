package flatmatch.flatmate_finder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class HouseholdMemberId implements Serializable {

    @Column(name = "household_id")
    private UUID householdId;

    @Column(name = "user_id")
    private UUID userId;
}

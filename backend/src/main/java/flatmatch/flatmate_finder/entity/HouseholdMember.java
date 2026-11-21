package flatmatch.flatmate_finder.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "household_members")
@Getter @Setter @NoArgsConstructor
public class HouseholdMember extends BaseEntity {

    @EmbeddedId
    private HouseholdMemberId id;

    @MapsId("householdId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "household_id")
    private Household household;

    @MapsId("userId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    public HouseholdMember(Household household, User user) {
        this.id = new HouseholdMemberId(household.getId(), user.getId());
        this.household = household;
        this.user = user;
    }
}

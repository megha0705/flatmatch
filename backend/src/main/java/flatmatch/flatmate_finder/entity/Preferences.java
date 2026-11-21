package flatmatch.flatmate_finder.entity;

import flatmatch.flatmate_finder.entity.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Preferences extends BaseEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(STRING)
    @Column(name = "looking_for", nullable = false)
    private LookingFor lookingFor;

    @Enumerated(STRING)
    @Column(name = "sleep_schedule", nullable = false)
    private SleepSchedule sleepSchedule;

    @Column(name = "cleanliness", nullable = false)
    private Short cleanliness;

    @Column(name = "noise_level", nullable = false)
    private Short noiseLevel;

    @Enumerated(STRING)
    @Column(name = "diet", nullable = false)
    private Diet diet;

    @Enumerated(STRING)
    @Column(name = "smoking", nullable = false)
    private SubstanceUse smoking;

    @Enumerated(STRING)
    @Column(name = "drinking", nullable = false)
    private SubstanceUse drinking;

    @Enumerated(STRING)
    @Column(name = "guests", nullable = false)
    private GuestPolicy guests;

    @Enumerated(STRING)
    @Column(name = "work_mode", nullable = false)
    private WorkMode workMode;

    @Column(name = "budget_min", nullable = false)
    private Integer budgetMin;

    @Column(name = "budget_max", nullable = false)
    private Integer budgetMax;

    @Enumerated(STRING)
    @Column(name = "gender_preference", nullable = false)
    @Builder.Default
    private GenderPreference genderPreference = GenderPreference.ANY;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "deal_breakers", nullable = false, columnDefinition = "text[]")
    @Builder.Default
    private List<String> dealBreakers = new ArrayList<>();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Override
    public Object getId() {
        return userId;
    }
}

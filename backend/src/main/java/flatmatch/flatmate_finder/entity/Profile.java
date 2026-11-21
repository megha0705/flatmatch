package flatmatch.flatmate_finder.entity;

import flatmatch.flatmate_finder.entity.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile extends BaseEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "age", nullable = false)
    private Short age;

    @Enumerated(STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "city", nullable = false)
    private String city;

    @Enumerated(STRING)
    @Column(name = "occupation", nullable = false)
    private Occupation occupation;

    @Column(name = "organization")
    private String organization;

    @Column(name = "bio")
    private String bio;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "work_label")
    private String workLabel;

    @Column(name = "work_lat")
    private Double workLat;

    @Column(name = "work_lng")
    private Double workLng;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Override
    public Object getId() {
        return userId;
    }

    public boolean hasWorkplace() {
        return workLat != null && workLng != null;
    }
}

package flatmatch.flatmate_finder.entity;

import flatmatch.flatmate_finder.entity.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "match_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatchRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "to_user_id")
    private User toUser;

    // null when there is no specific listing
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Enumerated(STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "intro_message")
    private String introMessage;

    @Column(name = "match_score")
    private Short matchScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    public boolean involves(UUID userId) {
        return fromUser.getId().equals(userId) || toUser.getId().equals(userId);
    }
}

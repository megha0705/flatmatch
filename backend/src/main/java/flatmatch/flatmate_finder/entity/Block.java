package flatmatch.flatmate_finder.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "blocks")
@Getter @Setter @NoArgsConstructor
public class Block extends BaseEntity {

    @EmbeddedId
    private BlockId id;

    @MapsId("blockerId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "blocker_id")
    private User blocker;

    @MapsId("blockedId")
    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "blocked_id")
    private User blocked;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Block(User blocker, User blocked) {
        this.id = new BlockId(blocker.getId(), blocked.getId());
        this.blocker = blocker;
        this.blocked = blocked;
    }
}

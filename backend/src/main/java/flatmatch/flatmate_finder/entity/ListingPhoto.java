package flatmatch.flatmate_finder.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "listing_photos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingPhoto extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "position", nullable = false)
    @Builder.Default
    private Short position = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

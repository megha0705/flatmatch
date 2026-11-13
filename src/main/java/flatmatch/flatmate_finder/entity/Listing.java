package flatmatch.flatmate_finder.entity;

import flatmatch.flatmate_finder.entity.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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
@Table(name = "listings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Listing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "locality", nullable = false)
    private String locality;

    @Column(name = "address_hint")
    private String addressHint;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "rent_per_person", nullable = false)
    private Integer rentPerPerson;

    @Column(name = "deposit")
    private Integer deposit;

    @Enumerated(STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;

    @Enumerated(STRING)
    @Column(name = "furnishing", nullable = false)
    @Builder.Default
    private Furnishing furnishing = Furnishing.SEMI_FURNISHED;

    @Enumerated(STRING)
    @Column(name = "gender_allowed", nullable = false)
    @Builder.Default
    private ListingGender genderAllowed = ListingGender.ANY;

    @Column(name = "current_flatmates", nullable = false)
    @Builder.Default
    private Short currentFlatmates = 0;

    @Column(name = "spots_available", nullable = false)
    @Builder.Default
    private Short spotsAvailable = 1;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "amenities", nullable = false, columnDefinition = "text[]")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Enumerated(STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.ACTIVE;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<ListingPhoto> photos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public void addPhoto(ListingPhoto photo) {
        photo.setListing(this);
        photos.add(photo);
    }

    public boolean hasLocation() {
        return lat != null && lng != null;
    }
}

package flatmatch.flatmate_finder.repository;

import flatmatch.flatmate_finder.entity.Listing;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID>, JpaSpecificationExecutor<Listing> {
    int countByOwnerIdAndStatus(UUID userId, ListingStatus listingStatus);

    Page<Listing> findByOwnerId(UUID id, Pageable pageable);

    @Query("""
        select l from Listing l
        where l.owner.id in :ownerIds
          and l.status = :active
          and l.spotsAvailable > 0
          and l.rentPerPerson between :minBudget and :maxBudget
        order by l.rentPerPerson asc, l.createdAt desc
        """)
    List<Listing> findMatchingListings(
            @Param("ownerIds") Collection<UUID> ownerIds,
            @Param("minBudget") int minBudget,
            @Param("maxBudget") int maxBudget,
            @Param("active") ListingStatus active);
}

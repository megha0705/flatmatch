package flatmatch.flatmate_finder.repository;

import flatmatch.flatmate_finder.entity.Preferences;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import flatmatch.flatmate_finder.entity.enums.LookingFor;
import flatmatch.flatmate_finder.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PreferencesRepository extends JpaRepository<Preferences, UUID> {

    default List<Preferences> findHostCandidates(UUID meId,
                                                 int minBudget, int maxBudget, int limit) {
        return queryHostsForSeeker(meId, minBudget, maxBudget,
                LookingFor.HAVE_ROOM, UserStatus.ACTIVE, ListingStatus.ACTIVE,
                PageRequest.of(0, limit));
    }

    @Query("""
            select p from Preferences p
              join User u on u.id = p.userId
              join Profile pr on pr.userId = p.userId
            where p.lookingFor = :hostSide
              and p.userId <> :meId
              and u.status = :active
              and u.emailVerified = true
              and not exists (
                    select b.id from Block b
                    where (b.id.blockerId = :meId and b.id.blockedId = p.userId)
                       or (b.id.blockedId = :meId and b.id.blockerId = p.userId))
              and exists (
                    select l.id from Listing l
                    where l.owner.id = p.userId
                      and l.status = :listingActive
                      and l.spotsAvailable > 0
                      and l.rentPerPerson between :minBudget and :maxBudget)
            order by u.lastActiveAt desc nulls last, p.userId
            """)
    List<Preferences> queryHostsForSeeker(
            @Param("meId") UUID meId,
            @Param("minBudget") int minBudget,
            @Param("maxBudget") int maxBudget,
            @Param("hostSide") LookingFor hostSide,
            @Param("active") UserStatus active,
            @Param("listingActive") ListingStatus listingActive,
            Pageable pageable);

}

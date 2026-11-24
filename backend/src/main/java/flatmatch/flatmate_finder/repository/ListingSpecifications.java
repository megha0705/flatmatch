package flatmatch.flatmate_finder.repository;

import flatmatch.flatmate_finder.dto.ListingSearchCriteria;
import flatmatch.flatmate_finder.entity.Block;
import flatmatch.flatmate_finder.entity.Listing;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ListingSpecifications {

    public static Specification<Listing> search(ListingSearchCriteria criteria, UUID meId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // only active listings
            predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

            if (criteria != null) {
                if (criteria.getCity() != null && !criteria.getCity().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("city")), "%" + criteria.getCity().trim().toLowerCase() + "%"));
                }
                if (criteria.getLocality() != null && !criteria.getLocality().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("locality")), "%" + criteria.getLocality().trim().toLowerCase() + "%"));
                }
                if (criteria.getMinRent() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("rentPerPerson"), criteria.getMinRent()));
                }
                if (criteria.getMaxRent() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("rentPerPerson"), criteria.getMaxRent()));
                }
                if (criteria.getRoomType() != null) {
                    predicates.add(cb.equal(root.get("roomType"), criteria.getRoomType()));
                }
                if (criteria.getFurnishing() != null) {
                    predicates.add(cb.equal(root.get("furnishing"), criteria.getFurnishing()));
                }
                if (criteria.getGenderAllowed() != null) {
                    predicates.add(cb.equal(root.get("genderAllowed"), criteria.getGenderAllowed()));
                }
                if (criteria.getAvailableBy() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("availableFrom"), criteria.getAvailableBy()));
                }
            }

            // exclude blocked users if meId is provided
            if (meId != null) {
                Subquery<UUID> blockSubquery = query.subquery(UUID.class);
                var blockRoot = blockSubquery.from(Block.class);
                blockSubquery.select(blockRoot.get("id").get("blockedId"));
                blockSubquery.where(cb.equal(blockRoot.get("id").get("blockerId"), meId));

                Subquery<UUID> blockedBySubquery = query.subquery(UUID.class);
                var blockedByRoot = blockedBySubquery.from(Block.class);
                blockedBySubquery.select(blockedByRoot.get("id").get("blockerId"));
                blockedBySubquery.where(cb.equal(blockedByRoot.get("id").get("blockedId"), meId));

                predicates.add(cb.not(root.get("owner").get("id").in(blockSubquery)));
                predicates.add(cb.not(root.get("owner").get("id").in(blockedBySubquery)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

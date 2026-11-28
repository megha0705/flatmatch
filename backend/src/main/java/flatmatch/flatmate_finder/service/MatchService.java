package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.dto.*;
import flatmatch.flatmate_finder.entity.Listing;
import flatmatch.flatmate_finder.entity.Preferences;
import flatmatch.flatmate_finder.entity.Profile;
import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import flatmatch.flatmate_finder.entity.enums.LookingFor;
import flatmatch.flatmate_finder.matching.MatchEvaluator;
import flatmatch.flatmate_finder.matching.MatchResult;
import flatmatch.flatmate_finder.repository.ListingRepository;
import flatmatch.flatmate_finder.repository.PreferencesRepository;
import flatmatch.flatmate_finder.repository.ProfileRepository;
import flatmatch.flatmate_finder.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    // score at most this many candidates per request, most recently active first
    private static final int CANDIDATE_LIMIT = 500;

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PreferencesRepository preferencesRepository;
    private final ListingRepository listingRepository;
    private final MatchEvaluator evaluator;

    // ---------- public API ----------

    @Transactional(readOnly = true)
    public PageResponse<MatchResponse> findMatches(String email, int page, int size) {

        List<MatchResponse> ranked = rankedMatches(loadSeeker(email));

        int total = ranked.size();
        int from = (int) Math.min((long) page * size, total);
        int to = Math.min(from + size, total);
        int totalPages = (int) Math.ceil(total / (double) size);

        return new PageResponse<>(List.copyOf(ranked.subList(from, to)), page, size, total, totalPages);
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(String email, UUID hostId) {
        // same pipeline as the list, so blocks, budgets and must-haves are applied identically.
        // Unknown, excluded and blocked people all give the same 404.
        return rankedMatches(loadSeeker(email)).stream()
                .filter(m -> m.getUserId().equals(hostId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));
    }

    // ---------- pipeline ----------

    private List<MatchResponse> rankedMatches(Seeker seeker) {
        Preferences myPrefs = seeker.getPrefs();
        Profile myProfile = seeker.getProfile();

        // 1. the database narrows the field
        List<Preferences> hosts = preferencesRepository.findHostCandidates(
                seeker.getUser().getId(),
                myPrefs.getBudgetMin(), myPrefs.getBudgetMax(), CANDIDATE_LIMIT);
        if (hosts.isEmpty()) {
            return List.of();
        }

        // 2. load everything needed for all candidates at once, not one by one
        List<UUID> hostIds = hosts.stream().map(Preferences::getUserId).toList();
        Map<UUID, Profile> profiles = profileRepository.findAllById(hostIds).stream()
                .collect(Collectors.toMap(Profile::getUserId, Function.identity()));
        // listings come back cheapest first, so the first one per host is the cheapest fit
        Map<UUID, List<Listing>> listings = listingRepository.findMatchingListings(
                        hostIds,
                        myPrefs.getBudgetMin(), myPrefs.getBudgetMax(), ListingStatus.ACTIVE).stream()
                .collect(Collectors.groupingBy(l -> l.getOwner().getId()));

        // 3. score each candidate with the pure evaluator
        List<MatchResponse> results = new ArrayList<>();
        for (Preferences host : hosts) {
            Profile hostProfile = profiles.get(host.getUserId());
            List<Listing> listing = listings.get(host.getUserId());
            if (hostProfile == null || listing == null) {
                continue;
            }

            // the listing's rent already fits the seeker's budget (the query guarantees it),
            // so drop the host's own budget range and let the budget factor be skipped
            Preferences forScoring = host.toBuilder().budgetMin(null).budgetMax(null).build();

            MatchResult result = evaluator.evaluate(
                    myPrefs, myProfile.getGender(), forScoring, hostProfile.getGender());
            if (!result.isEligible()) {
                continue;
            }
            results.add(toResponse(result, hostProfile, listing));
        }

        // 4. best score first; cheaper room, then id, break ties so pages stay stable
        results.sort(Comparator.comparingInt(MatchResponse::getScore).reversed()
                .thenComparingInt(m -> m.getListing().getRentPerPerson())
                .thenComparing(MatchResponse::getUserId));
        return results;
    }

    // ---------- helpers ----------

    private Seeker loadSeeker(String email) {
        User me = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> bad("Complete your profile first"));
        Preferences prefs = preferencesRepository.findById(me.getId())
                .orElseThrow(() -> bad("Fill in your habits and budget first"));

        if (prefs.getLookingFor() != LookingFor.NEED_ROOM) {
            throw bad("Matches are for people looking for a room. Check your requests instead.");
        }
        return new Seeker(me, profile, prefs);
    }

    private static MatchResponse toResponse(MatchResult result, Profile hostProfile, Listing listing) {
        List<MatchFactorResponse> factors = result.getFactors().stream()
                .map(f -> MatchFactorResponse.builder()
                        .label(f.getLabel())
                        .percent((int) Math.round(f.getScore() * 100))
                        .tone(f.getTone())
                        .reason(f.getReason())
                        .build())
                .toList();

        String firstPhoto = listing.getPhotos().isEmpty() ? null : listing.getPhotos().get(0).getUrl();

        return MatchResponse.builder()
                .userId(hostProfile.getUserId())
                .name(hostProfile.getName())
                .age(hostProfile.getAge())
                .occupation(hostProfile.getOccupation())
                .organization(hostProfile.getOrganization())
                .photoUrl(hostProfile.getPhotoUrl())
                .emailVerified(true)   // the candidate query only returns verified accounts
                .score(result.getScore())
                .band(result.getBand())
                .highlights(result.getHighlights())
                .warnings(result.getWarnings())
                .factors(factors)
                .listing(MatchListingSummary.builder()
                        .id(listing.getId())
                        .title(listing.getTitle())
                        .locality(listing.getLocality())
                        .rentPerPerson(listing.getRentPerPerson())
                        .roomType(listing.getRoomType())
                        .availableFrom(listing.getAvailableFrom())
                        .spotsAvailable(listing.getSpotsAvailable())
                        .photoUrl(firstPhoto)
                        .build())
                .build();
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }


}
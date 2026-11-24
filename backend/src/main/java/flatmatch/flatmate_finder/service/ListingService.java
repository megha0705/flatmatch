package flatmatch.flatmate_finder.service;

import flatmatch.flatmate_finder.dto.*;
import flatmatch.flatmate_finder.entity.Listing;
import flatmatch.flatmate_finder.entity.ListingPhoto;
import flatmatch.flatmate_finder.entity.Profile;
import flatmatch.flatmate_finder.entity.User;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import flatmatch.flatmate_finder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private static final int MAX_ACTIVE_LISTINGS = 5;
    private static final int MAX_PHOTOS = 10;
    private static final String PHOTO_FOLDER = "flatmate/listings";

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final BlockRepository blockRepository;
    private final ImageStorageService images;

    // ---------- create ----------

    @Transactional
    public ListingResponse create(String email, ListingRequest req, List<MultipartFile> files) {
        User me = currentUser(email);

        if ((req.getLat() == null) != (req.getLng() == null)) {
            throw bad("Provide both lat and lng, or neither");
        }
        //zone we should get from user's browser
        if (req.getAvailableFrom().isBefore(LocalDate.now(ZoneId.of("Asia/Kolkata")))) {
            throw bad("availableFrom cannot be in the past");
        }
        ensureUnderActiveLimit(me.getId());

        List<MultipartFile> photos = nonEmpty(files);
        if (photos.size() > MAX_PHOTOS) {
            throw bad("You can upload at most " + MAX_PHOTOS + " photos");
        }

        Listing listing = Listing.builder().owner(me).build();
        apply(listing, req);
        attachPhotos(listing, photos);
        listingRepository.save(listing);
        return toResponse(listing, me.getId());
    }

    // ---------- read ----------

    @Transactional(readOnly = true)
    public ListingResponse get(UUID id, String email) {
        User me = currentUser(email);
        Listing listing = listingRepository.findById(id).orElseThrow(ListingService::notFound);

        UUID ownerId = listing.getOwner().getId();
        boolean mine = ownerId.equals(me.getId());
        // other people only see active listings, and never across a block (404, not 403)
        if (!mine && (listing.getStatus() != ListingStatus.ACTIVE
                || blockRepository.existsBetween(me.getId(), ownerId))) {
            throw notFound();
        }
        return toResponse(listing, me.getId());
    }

   /* @Transactional(readOnly = true)
    public PageResponse<ListingResponse> search(ListingSearchCriteria criteria,
                                                String email, Pageable pageable) {
        User me = currentUser(email);
        if (criteria.getMinRent() != null && criteria.getMaxRent() != null
                && criteria.getMinRent() > criteria.getMaxRent()) {
            throw bad("minRent cannot be greater than maxRent");
        }
        Page<Listing> page = listingRepository.findAll(
                ListingSpecifications.search(criteria, me.getId()), pageable);
        return PageResponse.of(page, toResponses(page.getContent(), me.getId()));
    }*/

    @Transactional(readOnly = true)
    public PageResponse<ListingResponse> mine(String email, Pageable pageable) {
        User me = currentUser(email);
        Page<Listing> page = listingRepository.findByOwnerId(me.getId(), pageable);
        return PageResponse.of(page, toResponses(page.getContent(), me.getId()));
    }
    @Transactional
    public ListingResponse update(UUID id, String email, ListingRequest req) {
        User me = currentUser(email);
        Listing listing = findOwned(id, me.getId());
        validateCoordinates(req);
        apply(listing, req);            // photos are managed through their own endpoints
        return toResponse(listing, me.getId());
    }

    @Transactional
    public ListingResponse updateStatus(UUID id, String email, ListingStatus status) {
        User me = currentUser(email);
        Listing listing = findOwned(id, me.getId());
        if (status == ListingStatus.ACTIVE && listing.getStatus() != ListingStatus.ACTIVE) {
            ensureUnderActiveLimit(me.getId());
        }
        listing.setStatus(status);
        return toResponse(listing, me.getId());
    }

    @Transactional
    public void delete(UUID id, String email) {
        User me = currentUser(email);
        Listing listing = findOwned(id, me.getId());

        List<String> publicIds = listing.getPhotos().stream().map(ListingPhoto::getPublicId).toList();
        listingRepository.delete(listing);
        // only remove the images from Cloudinary once the database delete has committed
        runAfterCommit(() -> images.deleteQuietly(publicIds));
    }

    // ---------- photos ----------

    @Transactional
    public ListingResponse addPhotos(UUID id, String email, List<MultipartFile> files) {
        User me = currentUser(email);
        Listing listing = findOwned(id, me.getId());

        List<MultipartFile> photos = nonEmpty(files);
        if (photos.isEmpty()) {
            throw bad("No photos provided");
        }
        if (listing.getPhotos().size() + photos.size() > MAX_PHOTOS) {
            throw bad("A listing can have at most " + MAX_PHOTOS + " photos");
        }

        attachPhotos(listing, photos);
        listingRepository.saveAndFlush(listing);   // flush so the new photos get their ids
        return toResponse(listing, me.getId());
    }

    @Transactional
    public ListingResponse deletePhoto(UUID listingId, UUID photoId, String email) {
        User me = currentUser(email);
        Listing listing = findOwned(listingId, me.getId());

        ListingPhoto photo = listing.getPhotos().stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));

        listing.getPhotos().remove(photo);          // orphanRemoval deletes the row
        String publicId = photo.getPublicId();
        runAfterCommit(() -> images.deleteQuietly(Collections.singletonList(publicId)));
        return toResponse(listing, me.getId());
    }

    // ---------- helpers ----------

    /** Uploads to Cloudinary and adds the photos to the listing. */
    private void attachPhotos(Listing listing, List<MultipartFile> files) {
        if (files.isEmpty()) return;

        List<StoredImage> stored = images.uploadAll(files, PHOTO_FOLDER);

        // if the database transaction fails, remove what we just uploaded
        List<String> uploadedIds = stored.stream().map(StoredImage::getPublicId).toList();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    images.deleteQuietly(uploadedIds);
                }
            }
        });

        int next = listing.getPhotos().stream().mapToInt(p -> p.getPosition()).max().orElse(-1) + 1;
        for (int i = 0; i < stored.size(); i++) {
            StoredImage image = stored.get(i);
            listing.addPhoto(ListingPhoto.builder()
                    .url(image.getUrl())
                    .publicId(image.getPublicId())
                    .position((short) (next + i))
                    .build());
        }
    }

    private static void runAfterCommit(Runnable task) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                task.run();
            }
        });
    }

    private static List<MultipartFile> nonEmpty(List<MultipartFile> files) {
        if (files == null) return List.of();
        return files.stream().filter(f -> f != null && !f.isEmpty()).toList();
    }

    private User currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
    }

    private Listing findOwned(UUID id, UUID userId) {
        Listing listing = listingRepository.findById(id).orElseThrow(ListingService::notFound);
        if (!listing.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your listing");
        }
        return listing;
    }

    private void ensureUnderActiveLimit(UUID userId) {
        if (listingRepository.countByOwnerIdAndStatus(userId, ListingStatus.ACTIVE) >= MAX_ACTIVE_LISTINGS) {
            throw bad("You can have at most " + MAX_ACTIVE_LISTINGS + " active listings");
        }
    }

    private static void validateCoordinates(ListingRequest r) {
        if ((r.getLat() == null) != (r.getLng() == null)) {
            throw bad("Provide both lat and lng, or neither");
        }
    }

    private void apply(Listing l, ListingRequest r) {
        l.setTitle(r.getTitle().trim());
        l.setDescription(blankToNull(r.getDescription()));
        l.setCity(r.getCity().trim());
        l.setLocality(r.getLocality().trim());
        l.setAddressHint(blankToNull(r.getAddressHint()));
        // rounded to 3 decimals (about 100 m) so exact home locations are never stored
        l.setLat(round(r.getLat()));
        l.setLng(round(r.getLng()));
        l.setRentPerPerson(r.getRentPerPerson());
        l.setDeposit(r.getDeposit());
        l.setRoomType(r.getRoomType());
        if (r.getFurnishing() != null) l.setFurnishing(r.getFurnishing());
        if (r.getGenderAllowed() != null) l.setGenderAllowed(r.getGenderAllowed());
        if (r.getCurrentFlatmates() != null) l.setCurrentFlatmates(r.getCurrentFlatmates());
        if (r.getSpotsAvailable() != null) l.setSpotsAvailable(r.getSpotsAvailable());
        if (r.getAmenities() != null) {
            l.setAmenities(r.getAmenities().stream()
                    .map(String::trim).filter(s -> !s.isEmpty()).distinct()
                    .collect(Collectors.toCollection(ArrayList::new)));
        }
        l.setAvailableFrom(r.getAvailableFrom());
    }

    private ListingResponse toResponse(Listing listing, UUID meId) {
        return toResponses(List.of(listing), meId).get(0);
    }

    // loads all owners and profiles with 2 queries, not 2 per listing
    private List<ListingResponse> toResponses(List<Listing> listings, UUID meId) {
        Set<UUID> ownerIds = listings.stream()
                .map(l -> l.getOwner().getId()).collect(Collectors.toSet());
        Map<UUID, User> users = userRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<UUID, Profile> profiles = profileRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(Profile::getUserId, Function.identity()));

        return listings.stream().map(l -> {
            UUID ownerId = l.getOwner().getId();
            User owner = users.get(ownerId);
            Profile profile = profiles.get(ownerId);
            return new ListingResponse(
                    l.getId(), l.getTitle(), l.getDescription(), l.getCity(), l.getLocality(),
                    l.getAddressHint(), l.getLat(), l.getLng(), l.getRentPerPerson(), l.getDeposit(),
                    l.getRoomType(), l.getFurnishing(), l.getGenderAllowed(),
                    l.getCurrentFlatmates(), l.getSpotsAvailable(), List.copyOf(l.getAmenities()),
                    l.getAvailableFrom(), l.getStatus(),
                    l.getPhotos().stream()
                            .map(p->new PhotoSummary(p.getId(), p.getUrl(), p.getPosition()))
                            .toList(),
                    new OwnerSummary(
                            ownerId,
                            profile != null ? profile.getName() : "Unknown",
                            owner != null && owner.isEmailVerified()),
                    ownerId.equals(meId),
                    l.getCreatedAt());
        }).toList();
    }

    private static Double round(Double v) {
        return v == null ? null : Math.round(v * 1000.0) / 1000.0;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found");
    }
}
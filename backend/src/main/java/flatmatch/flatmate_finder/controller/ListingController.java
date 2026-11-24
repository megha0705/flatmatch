package flatmatch.flatmate_finder.controller;

import flatmatch.flatmate_finder.dto.*;
import flatmatch.flatmate_finder.entity.enums.ListingStatus;
import flatmatch.flatmate_finder.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    // only these sort keys are allowed, so clients can't sort by arbitrary columns
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "newest", "createdAt",
            "rent", "rentPerPerson",
            "available", "availableFrom");

    private final ListingService listingService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ListingResponse create(
            @Valid @RequestPart("listing") ListingRequest request,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            Authentication auth) {
        return listingService.create(auth.getName(), request, photos);
    }

/*    @GetMapping
    public PageResponse<ListingResponse> search(
            @ModelAttribute ListingSearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication auth) {
        return listingService.search(criteria, auth.getName(), pageable(page, size, sort, direction));
    }
*/
    @GetMapping("/mine")
    public PageResponse<ListingResponse> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        return listingService.mine(auth.getName(), pageable(page, size, "newest", "desc"));
    }

    @GetMapping("/{id}")
    public ListingResponse get(@PathVariable UUID id, Authentication auth) {
        return listingService.get(id, auth.getName());
    }

    @PutMapping("/{id}")
    public ListingResponse update(@PathVariable UUID id,
                                  @Valid @RequestBody ListingRequest request,
                                  Authentication auth) {
        return listingService.update(id, auth.getName(), request);
    }

    @PatchMapping("/{id}/status")
    public ListingResponse updateStatus(@PathVariable UUID id,
                                        @RequestBody ListingStatus request,
                                        Authentication auth) {
        return listingService.updateStatus(id, auth.getName(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        listingService.delete(id, auth.getName());
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ListingResponse addPhotos(@PathVariable UUID id,
                                     @RequestPart("photos") List<MultipartFile> photos,
                                     Authentication auth) {
        return listingService.addPhotos(id, auth.getName(), photos);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ListingResponse deletePhoto(@PathVariable UUID id,
                                       @PathVariable UUID photoId,
                                       Authentication auth) {
        return listingService.deletePhoto(id, photoId, auth.getName());
    }

    private static PageRequest pageable(int page, int size, String sort, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);        // never more than 50 per page
        String field = SORT_FIELDS.getOrDefault(sort, "createdAt");
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        // "id" as a tie-breaker keeps pages stable when many rows share a value
        return PageRequest.of(safePage, safeSize, Sort.by(dir, field).and(Sort.by("id")));
    }
}
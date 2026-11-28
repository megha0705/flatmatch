package flatmatch.flatmate_finder.controller;

import flatmatch.flatmate_finder.dto.MatchResponse;
import flatmatch.flatmate_finder.dto.PageResponse;
import flatmatch.flatmate_finder.service.MatchService;
import flatmatch.flatmate_finder.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchingService;

    @GetMapping
    public PageResponse<MatchResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);   // never more than 50 per page
        return matchingService.findMatches(auth.getName(), safePage, safeSize);
    }

    @GetMapping("/{userId}")
    public MatchResponse get(@PathVariable UUID userId, Authentication auth) {
        return matchingService.getMatch(auth.getName(), userId);
    }
}
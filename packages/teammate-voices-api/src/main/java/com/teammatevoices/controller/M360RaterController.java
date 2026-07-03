package com.teammatevoices.controller;

import com.teammatevoices.dto.M360RaterDTO;
import com.teammatevoices.dto.M360RaterDTO.PersonSearchResultDTO;
import com.teammatevoices.dto.M360RaterDTO.SelectionViewDTO;
import com.teammatevoices.service.M360RaterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Token routes for the shared "Rater selection review" screen.
 * /m360/rater-selection/{token} — participant token (select mode)
 * /m360/approval/{token}        — manager token (approve mode)
 * Both resolve through the same service; the token type decides the mode.
 */
@RestController
@RequestMapping("/m360")
public class M360RaterController {

    private static final Logger log = LoggerFactory.getLogger(M360RaterController.class);

    private final M360RaterService raterService;

    public M360RaterController(M360RaterService raterService) {
        this.raterService = raterService;
    }

    // ── Shared view (either token) ────────────────────────────────────────────

    @GetMapping({"/rater-selection/{token}", "/approval/{token}"})
    public ResponseEntity<SelectionViewDTO> getView(@PathVariable String token) {
        log.info("GET m360 rater view {}", token);
        return ResponseEntity.ok(raterService.getSelectionView(token));
    }

    @GetMapping({"/rater-selection/{token}/people", "/approval/{token}/people"})
    public ResponseEntity<List<PersonSearchResultDTO>> searchPeople(@PathVariable String token,
                                                                    @RequestParam(required = false) String name,
                                                                    @RequestParam(required = false) String lob) {
        return ResponseEntity.ok(raterService.searchPeople(token, name, lob));
    }

    @PostMapping({"/rater-selection/{token}/raters", "/approval/{token}/raters"})
    public ResponseEntity<SelectionViewDTO> addRater(@PathVariable String token, @RequestBody M360RaterDTO dto) {
        return ResponseEntity.ok(raterService.addRater(token, dto));
    }

    @DeleteMapping({"/rater-selection/{token}/raters/{raterAssignmentId}", "/approval/{token}/raters/{raterAssignmentId}"})
    public ResponseEntity<SelectionViewDTO> removeRater(@PathVariable String token,
                                                        @PathVariable Long raterAssignmentId) {
        return ResponseEntity.ok(raterService.removeRater(token, raterAssignmentId));
    }

    @PutMapping({"/rater-selection/{token}/raters/{raterAssignmentId}/relationship", "/approval/{token}/raters/{raterAssignmentId}/relationship"})
    public ResponseEntity<SelectionViewDTO> updateRelationship(@PathVariable String token,
                                                               @PathVariable Long raterAssignmentId,
                                                               @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(raterService.updateRaterRelationship(token, raterAssignmentId, body.get("relationship")));
    }

    // ── Participant submit ────────────────────────────────────────────────────

    @PostMapping("/rater-selection/{token}/submit")
    public ResponseEntity<SelectionViewDTO> submitSelection(@PathVariable String token) {
        log.info("POST /m360/rater-selection/{}/submit", token);
        return ResponseEntity.ok(raterService.submitSelection(token));
    }

    // ── Manager actions ───────────────────────────────────────────────────────

    @PostMapping("/approval/{token}/raters/{raterAssignmentId}/approve")
    public ResponseEntity<SelectionViewDTO> approveRater(@PathVariable String token,
                                                         @PathVariable Long raterAssignmentId) {
        return ResponseEntity.ok(raterService.approveRater(token, raterAssignmentId));
    }

    @PostMapping("/approval/{token}/raters/{raterAssignmentId}/reject")
    public ResponseEntity<SelectionViewDTO> rejectRater(@PathVariable String token,
                                                        @PathVariable Long raterAssignmentId,
                                                        @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(raterService.rejectRater(token, raterAssignmentId, body.get("reason")));
    }

    @PostMapping("/approval/{token}/complete")
    public ResponseEntity<SelectionViewDTO> completeApproval(@PathVariable String token) {
        log.info("POST /m360/approval/{}/complete", token);
        return ResponseEntity.ok(raterService.completeApproval(token));
    }
}

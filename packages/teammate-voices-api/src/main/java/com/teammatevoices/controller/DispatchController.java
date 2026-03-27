package com.teammatevoices.controller;

import com.teammatevoices.dto.DispatchDTO;
import com.teammatevoices.service.DispatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dispatches")
public class DispatchController {

    private static final Logger log = LoggerFactory.getLogger(DispatchController.class);

    private final DispatchService dispatchService;

    public DispatchController(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @GetMapping
    public ResponseEntity<List<DispatchDTO>> getAllDispatches() {
        log.info("GET /dispatches");
        return ResponseEntity.ok(dispatchService.getAllDispatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchDTO> getDispatchById(@PathVariable Long id) {
        log.info("GET /dispatches/{}", id);
        return ResponseEntity.ok(dispatchService.getDispatchById(id));
    }

    @GetMapping("/participant/{participantId}")
    public ResponseEntity<List<DispatchDTO>> getByParticipant(@PathVariable String participantId) {
        log.info("GET /dispatches/participant/{}", participantId);
        return ResponseEntity.ok(dispatchService.getDispatchesByParticipant(participantId));
    }

    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<DispatchDTO>> getBySurvey(@PathVariable Long surveyId) {
        log.info("GET /dispatches/survey/{}", surveyId);
        return ResponseEntity.ok(dispatchService.getDispatchesBySurvey(surveyId));
    }

    /**
     * Dispatch a survey to all program participants.
     * Creates dispatch records, generates unique tokens, sends invitation emails.
     */
    @PostMapping("/survey/{surveyId}/send")
    public ResponseEntity<Map<String, Object>> dispatchSurvey(
            @PathVariable Long surveyId,
            @RequestParam(defaultValue = "http://localhost:5175") String baseUrl) {
        log.info("POST /dispatches/survey/{}/send", surveyId);
        DispatchService.DispatchResult result = dispatchService.dispatchSurvey(surveyId, baseUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "created", result.created(),
                "emailsSent", result.emailsSent(),
                "skipped", result.skipped(),
                "errors", result.errors()
        ));
    }

    /**
     * Ad-hoc dispatch: send to a specific list of participant IDs and/or
     * raw email addresses. Useful for pulse checks, targeted follow-ups,
     * and one-off sends outside the normal program dispatch flow.
     *
     * Request body:
     * {
     *   "participantIds": ["P001", "P002"],
     *   "adhocEmails":    ["jane@example.com"],
     *   "scheduledAt":    "2026-04-01T09:00:00" (optional, reserved for future scheduling)
     * }
     */
    @PostMapping("/survey/{surveyId}/adhoc")
    public ResponseEntity<Map<String, Object>> adHocDispatch(
            @PathVariable Long surveyId,
            @RequestParam(defaultValue = "http://localhost:5175") String baseUrl,
            @RequestBody Map<String, Object> body) {

        log.info("POST /dispatches/survey/{}/adhoc", surveyId);

        @SuppressWarnings("unchecked")
        List<String> participantIds = body.containsKey("participantIds")
                ? (List<String>) body.get("participantIds")
                : Collections.emptyList();

        @SuppressWarnings("unchecked")
        List<String> adhocEmails = body.containsKey("adhocEmails")
                ? (List<String>) body.get("adhocEmails")
                : Collections.emptyList();

        DispatchService.DispatchResult result =
                dispatchService.adHocDispatch(surveyId, participantIds, adhocEmails, baseUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "created", result.created(),
                "emailsSent", result.emailsSent(),
                "skipped", result.skipped(),
                "errors", result.errors()
        ));
    }
}

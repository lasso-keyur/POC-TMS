package com.teammatevoices.controller;

import com.teammatevoices.dto.M360ActivityDTO;
import com.teammatevoices.dto.SurveyDTO;
import com.teammatevoices.dto.request.SubmitSurveyRequest;
import com.teammatevoices.service.M360FeedbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/m360")
public class M360FeedbackController {

    private static final Logger log = LoggerFactory.getLogger(M360FeedbackController.class);

    private final M360FeedbackService feedbackService;

    public M360FeedbackController(M360FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /** Load the survey for a rater feedback token (mirrors /respond/{token}). */
    @GetMapping("/feedback/{token}")
    public ResponseEntity<SurveyDTO> getFeedbackSurvey(@PathVariable String token) {
        log.info("GET /m360/feedback/{}", token);
        return ResponseEntity.ok(feedbackService.getFeedbackSurvey(token));
    }

    @PostMapping("/feedback/{token}/submit")
    public ResponseEntity<Map<String, Object>> submitFeedback(@PathVariable String token,
                                                              @RequestBody SubmitSurveyRequest request) {
        log.info("POST /m360/feedback/{}/submit", token);
        Long responseId = feedbackService.submitFeedback(token, request.getAnswers());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("responseId", responseId, "message", "Feedback submitted successfully"));
    }

    /** Dashboard activity rows (view-only). */
    @GetMapping("/activities")
    public ResponseEntity<List<M360ActivityDTO>> getActivities() {
        return ResponseEntity.ok(feedbackService.getActivities());
    }
}

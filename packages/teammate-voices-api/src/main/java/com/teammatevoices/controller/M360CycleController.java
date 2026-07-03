package com.teammatevoices.controller;

import com.teammatevoices.dto.M360CycleDTO;
import com.teammatevoices.dto.M360EnrollmentDTO;
import com.teammatevoices.dto.M360ReportDTO;
import com.teammatevoices.service.M360CycleService;
import com.teammatevoices.service.M360FeedbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/m360/cycles")
public class M360CycleController {

    private static final Logger log = LoggerFactory.getLogger(M360CycleController.class);

    private final M360CycleService cycleService;
    private final M360FeedbackService feedbackService;

    public M360CycleController(M360CycleService cycleService, M360FeedbackService feedbackService) {
        this.cycleService = cycleService;
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public ResponseEntity<List<M360CycleDTO>> getCycles(@RequestParam(required = false) Long programId) {
        log.info("GET /m360/cycles?programId={}", programId);
        return ResponseEntity.ok(cycleService.getCyclesForProgram(programId));
    }

    @GetMapping("/{cycleId}")
    public ResponseEntity<M360CycleDTO> getCycle(@PathVariable Long cycleId) {
        return ResponseEntity.ok(cycleService.getCycle(cycleId));
    }

    @PostMapping
    public ResponseEntity<M360CycleDTO> createCycle(@RequestBody M360CycleDTO dto) {
        log.info("POST /m360/cycles");
        return ResponseEntity.status(HttpStatus.CREATED).body(cycleService.createCycle(dto));
    }

    @PutMapping("/{cycleId}")
    public ResponseEntity<M360CycleDTO> updateCycle(@PathVariable Long cycleId, @RequestBody M360CycleDTO dto) {
        return ResponseEntity.ok(cycleService.updateCycle(cycleId, dto));
    }

    @PutMapping("/{cycleId}/phases")
    public ResponseEntity<M360CycleDTO> savePhases(@PathVariable Long cycleId,
                                                   @RequestBody List<M360CycleDTO.PhaseDTO> phases) {
        return ResponseEntity.ok(cycleService.savePhases(cycleId, phases));
    }

    @PutMapping("/{cycleId}/criteria")
    public ResponseEntity<M360CycleDTO> saveCriteria(@PathVariable Long cycleId,
                                                     @RequestBody List<M360CycleDTO.CriteriaDTO> criteria) {
        return ResponseEntity.ok(cycleService.saveCriteria(cycleId, criteria));
    }

    @PostMapping("/{cycleId}/duplicate")
    public ResponseEntity<M360CycleDTO> duplicateCycle(@PathVariable Long cycleId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cycleService.duplicateCycle(cycleId));
    }

    @DeleteMapping("/{cycleId}")
    public ResponseEntity<Void> deleteCycle(@PathVariable Long cycleId) {
        cycleService.deleteCycle(cycleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{cycleId}/enrollments")
    public ResponseEntity<List<M360EnrollmentDTO>> getEnrollments(@PathVariable Long cycleId) {
        return ResponseEntity.ok(cycleService.getEnrollments(cycleId));
    }

    @PostMapping("/{cycleId}/enrollments")
    public ResponseEntity<List<M360EnrollmentDTO>> enrollParticipants(@PathVariable Long cycleId,
                                                                      @RequestBody Map<String, List<String>> body) {
        List<String> participantIds = body.getOrDefault("participantIds", List.of());
        return ResponseEntity.ok(cycleService.enrollParticipants(cycleId, participantIds));
    }

    @DeleteMapping("/{cycleId}/enrollments/{enrollmentId}")
    public ResponseEntity<Void> removeEnrollment(@PathVariable Long cycleId, @PathVariable Long enrollmentId) {
        cycleService.removeEnrollment(cycleId, enrollmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{cycleId}/participants/{participantId}/report")
    public ResponseEntity<M360ReportDTO> getReport(@PathVariable Long cycleId, @PathVariable String participantId) {
        return ResponseEntity.ok(feedbackService.getReport(cycleId, participantId));
    }
}

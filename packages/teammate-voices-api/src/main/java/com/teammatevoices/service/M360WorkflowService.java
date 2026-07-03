package com.teammatevoices.service;

import com.teammatevoices.model.*;
import com.teammatevoices.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * M360 workflow automation. Runs every 5 minutes:
 *
 * 1. Phase comm activities — for every ACTIVE cycle, enabled phase, enabled activity
 *    whose activity_date has arrived and that hasn't been sent yet, sends the linked
 *    comms template to the phase-appropriate audience and stamps sent_at (send-once).
 * 2. Feedback expiry — INVITED/IN_PROGRESS raters past the Rater Feedback window
 *    are marked EXPIRED so reports don't wait on them.
 *
 * Every automated action is written to WORKFLOW_AUDIT_LOG.
 */
@Service
public class M360WorkflowService {

    private static final Logger log = LoggerFactory.getLogger(M360WorkflowService.class);

    @Value("${app.base-url:http://localhost:5200}")
    private String baseUrl;

    private final M360CycleRepository cycleRepository;
    private final M360EnrollmentRepository enrollmentRepository;
    private final M360RaterAssignmentRepository raterRepository;
    private final ParticipantRepository participantRepository;
    private final EmailSendingService emailSendingService;
    private final WorkflowAuditLogRepository auditRepository;

    public M360WorkflowService(M360CycleRepository cycleRepository,
                               M360EnrollmentRepository enrollmentRepository,
                               M360RaterAssignmentRepository raterRepository,
                               ParticipantRepository participantRepository,
                               EmailSendingService emailSendingService,
                               WorkflowAuditLogRepository auditRepository) {
        this.cycleRepository = cycleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.raterRepository = raterRepository;
        this.participantRepository = participantRepository;
        this.emailSendingService = emailSendingService;
        this.auditRepository = auditRepository;
    }

    @Scheduled(fixedRate = 300000, initialDelay = 20000) // every 5 minutes, 20s after startup
    @Transactional
    public void runWorkflow() {
        int commsSent = 0;
        int expired = 0;
        for (M360Cycle cycle : cycleRepository.findAll()) {
            if (!"ACTIVE".equals(cycle.getStatus())) continue;
            commsSent += processPhaseActivities(cycle);
            expired += expireOverdueFeedback(cycle);
        }
        if (commsSent > 0 || expired > 0) {
            log.info("M360 workflow run complete: {} comms sent, {} feedback invitations expired", commsSent, expired);
        }
    }

    // ── Phase comm activities ─────────────────────────────────────────────────

    private int processPhaseActivities(M360Cycle cycle) {
        int sent = 0;
        LocalDate today = LocalDate.now();
        for (M360CyclePhase phase : cycle.getPhases()) {
            if (!Boolean.TRUE.equals(phase.getIsEnabled())) continue;
            for (M360PhaseActivity activity : phase.getActivities()) {
                if (!Boolean.TRUE.equals(activity.getIsEnabled())) continue;
                if (activity.getSentAt() != null) continue;
                if (activity.getEmailTemplateId() == null) continue;
                if (activity.getActivityDate() == null || activity.getActivityDate().isAfter(today)) continue;

                int recipients = sendActivity(cycle, phase, activity);
                activity.setSentAt(LocalDateTime.now());
                sent += recipients;

                auditRepository.save(WorkflowAuditLog
                        .create("M360_CYCLE", cycle.getCycleId(), "COMM_SENT")
                        .withPerformedBy("system-scheduler")
                        .withDetails("{\"phase\":\"" + phase.getPhaseType() + "\",\"activity\":\""
                                + activity.getActivityName() + "\",\"recipients\":" + recipients + "}"));
            }
        }
        return sent;
    }

    /** Audience is derived from the phase type (activities named "Manager …" go to managers). */
    private int sendActivity(M360Cycle cycle, M360CyclePhase phase, M360PhaseActivity activity) {
        List<M360Enrollment> enrollments = enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycle.getCycleId());
        boolean managerAudience = activity.getActivityName() != null
                && activity.getActivityName().toLowerCase().contains("manager");
        int recipients = 0;

        for (M360Enrollment e : enrollments) {
            switch (phase.getPhaseType()) {
                case "RATER_SELECTION" -> {
                    if (!"ENROLLED".equals(e.getStatus())) continue;
                    recipients += sendToParticipant(cycle, e,
                            "/m360/rater-selection/" + e.getParticipantToken(), activity) ? 1 : 0;
                }
                case "RATER_APPROVAL" -> {
                    if (!"RATERS_SUBMITTED".equals(e.getStatus())) continue;
                    recipients += sendToManager(cycle, e,
                            "/m360/approval/" + e.getManagerToken(), activity) ? 1 : 0;
                }
                case "RATER_FEEDBACK" -> {
                    for (M360RaterAssignment rater :
                            raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(e.getEnrollmentId())) {
                        if (!"INVITED".equals(rater.getStatus()) && !"IN_PROGRESS".equals(rater.getStatus())) continue;
                        Map<String, String> data = mergeData(cycle, e);
                        data.put("rater_name", rater.getRaterName());
                        data.put("relationship", rater.getRelationship());
                        data.put("feedback_link", frontendUrl("/m360/feedback/" + rater.getFeedbackToken()));
                        if (emailSendingService.sendTemplate(activity.getEmailTemplateId(), rater.getRaterEmail(), data)) {
                            recipients++;
                        }
                    }
                }
                default -> { // ENROLLMENT, PRE_LAUNCH, REPORT_DELIVERY, POST_SURVEY
                    if (managerAudience) {
                        recipients += sendToManager(cycle, e, "/", activity) ? 1 : 0;
                    } else {
                        recipients += sendToParticipant(cycle, e, "/", activity) ? 1 : 0;
                    }
                }
            }
        }
        log.info("M360 activity '{}' ({}) sent to {} recipient(s) for cycle {}",
                activity.getActivityName(), phase.getPhaseType(), recipients, cycle.getName());
        return recipients;
    }

    private boolean sendToParticipant(M360Cycle cycle, M360Enrollment e, String path, M360PhaseActivity activity) {
        Participant p = participantRepository.findById(e.getParticipantId()).orElse(null);
        if (p == null || p.getEmail() == null) return false;
        Map<String, String> data = mergeData(cycle, e);
        data.put("selection_link", frontendUrl(path));
        return emailSendingService.sendTemplate(activity.getEmailTemplateId(), p.getEmail(), data);
    }

    private boolean sendToManager(M360Cycle cycle, M360Enrollment e, String path, M360PhaseActivity activity) {
        if (e.getManagerEmail() == null) return false;
        Map<String, String> data = mergeData(cycle, e);
        data.put("approval_link", frontendUrl(path));
        return emailSendingService.sendTemplate(activity.getEmailTemplateId(), e.getManagerEmail(), data);
    }

    // ── Feedback expiry ───────────────────────────────────────────────────────

    private int expireOverdueFeedback(M360Cycle cycle) {
        LocalDateTime feedbackEnd = cycle.getPhases().stream()
                .filter(p -> "RATER_FEEDBACK".equals(p.getPhaseType()) && Boolean.TRUE.equals(p.getIsEnabled()))
                .map(M360CyclePhase::getEndAt)
                .filter(java.util.Objects::nonNull)
                .findFirst().orElse(null);
        if (feedbackEnd == null || feedbackEnd.isAfter(LocalDateTime.now())) return 0;

        int expired = 0;
        for (M360Enrollment e : enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycle.getCycleId())) {
            for (M360RaterAssignment rater :
                    raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(e.getEnrollmentId())) {
                if (!"INVITED".equals(rater.getStatus()) && !"IN_PROGRESS".equals(rater.getStatus())) continue;
                String previous = rater.getStatus();
                rater.setStatus("EXPIRED");
                raterRepository.save(rater);
                expired++;
                auditRepository.save(WorkflowAuditLog
                        .create("M360_ENROLLMENT", e.getEnrollmentId(), "FEEDBACK_EXPIRED")
                        .withStateChange(previous, "EXPIRED")
                        .withPerformedBy("system-scheduler")
                        .withDetails("{\"rater\":\"" + rater.getRaterName() + "\"}"));
            }
        }
        return expired;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Map<String, String> mergeData(M360Cycle cycle, M360Enrollment e) {
        Map<String, String> data = new HashMap<>();
        data.put("cycle_name", cycle.getName());
        data.put("manager_name", e.getManagerName() != null ? e.getManagerName() : "Manager");
        participantRepository.findById(e.getParticipantId())
                .ifPresent(p -> data.put("participant_name", p.getFullName()));
        cycle.getPhases().stream()
                .filter(p -> "RATER_SELECTION".equals(p.getPhaseType()) && p.getEndAt() != null)
                .findFirst().ifPresent(p -> data.put("rater_selection_end", p.getEndAt().toLocalDate().toString()));
        cycle.getPhases().stream()
                .filter(p -> "RATER_APPROVAL".equals(p.getPhaseType()) && p.getEndAt() != null)
                .findFirst().ifPresent(p -> data.put("rater_approval_end", p.getEndAt().toLocalDate().toString()));
        cycle.getPhases().stream()
                .filter(p -> "RATER_FEEDBACK".equals(p.getPhaseType()) && p.getEndAt() != null)
                .findFirst().ifPresent(p -> data.put("due_date", p.getEndAt().toLocalDate().toString()));
        return data;
    }

    private String frontendUrl(String path) {
        return baseUrl + path;
    }
}

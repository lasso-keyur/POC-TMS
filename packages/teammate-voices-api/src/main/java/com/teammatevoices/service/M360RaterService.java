package com.teammatevoices.service;

import com.teammatevoices.dto.M360CycleDTO.CriteriaDTO;
import com.teammatevoices.dto.M360RaterDTO;
import com.teammatevoices.dto.M360RaterDTO.PersonSearchResultDTO;
import com.teammatevoices.dto.M360RaterDTO.SelectionViewDTO;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.*;
import com.teammatevoices.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class M360RaterService {

    private static final Logger log = LoggerFactory.getLogger(M360RaterService.class);

    private final M360EnrollmentRepository enrollmentRepository;
    private final M360RaterAssignmentRepository raterRepository;
    private final M360CycleRepository cycleRepository;
    private final ParticipantRepository participantRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailSendingService emailSendingService;

    public M360RaterService(M360EnrollmentRepository enrollmentRepository,
                            M360RaterAssignmentRepository raterRepository,
                            M360CycleRepository cycleRepository,
                            ParticipantRepository participantRepository,
                            EmailTemplateRepository emailTemplateRepository,
                            EmailSendingService emailSendingService) {
        this.enrollmentRepository = enrollmentRepository;
        this.raterRepository = raterRepository;
        this.cycleRepository = cycleRepository;
        this.participantRepository = participantRepository;
        this.emailTemplateRepository = emailTemplateRepository;
        this.emailSendingService = emailSendingService;
    }

    // ── View (selection + approval share one screen) ──────────────────────────

    @Transactional
    public SelectionViewDTO getSelectionView(String token) {
        Resolved r = resolve(token);
        autoLoadDefaults(r);
        return buildView(r);
    }

    @Transactional(readOnly = true)
    public List<PersonSearchResultDTO> searchPeople(String token, String name, String lob) {
        Resolved r = resolve(token);
        List<String> existingEmails = raterRepository
                .findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId()).stream()
                .map(M360RaterAssignment::getRaterEmail)
                .collect(Collectors.toList());
        return participantRepository.findAll().stream()
                .filter(p -> !p.getParticipantId().equals(r.enrollment.getParticipantId()))
                .filter(p -> !existingEmails.contains(p.getEmail()))
                .filter(p -> name == null || name.isBlank()
                        || p.getFullName().toLowerCase().contains(name.toLowerCase()))
                .filter(p -> lob == null || lob.isBlank()
                        || (p.getLineOfBusiness() != null && p.getLineOfBusiness().equalsIgnoreCase(lob)))
                .limit(25)
                .map(p -> {
                    PersonSearchResultDTO dto = new PersonSearchResultDTO();
                    dto.setParticipantId(p.getParticipantId());
                    dto.setFullName(p.getFullName());
                    dto.setEmail(p.getEmail());
                    dto.setLineOfBusiness(p.getLineOfBusiness());
                    dto.setRegion(p.getRegion());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ── Mutations ─────────────────────────────────────────────────────────────

    @Transactional
    public SelectionViewDTO addRater(String token, M360RaterDTO dto) {
        Resolved r = resolve(token);
        if (raterRepository.existsByEnrollmentIdAndRaterEmail(r.enrollment.getEnrollmentId(), dto.getRaterEmail())) {
            throw new BusinessRuleException("This person is already in the rater list.");
        }
        enforceMaxLimits(r, dto.getRelationship());

        M360RaterAssignment rater = new M360RaterAssignment();
        rater.setEnrollmentId(r.enrollment.getEnrollmentId());
        rater.setRaterParticipantId(dto.getRaterParticipantId());
        rater.setRaterName(dto.getRaterName());
        rater.setRaterEmail(dto.getRaterEmail());
        rater.setRelationship(dto.getRelationship());
        rater.setAddedBy(r.isManager ? "MANAGER" : "SELF");
        rater.setStatus(r.isManager ? "APPROVED" : "PENDING_APPROVAL");
        raterRepository.save(rater);
        return buildView(r);
    }

    @Transactional
    public SelectionViewDTO removeRater(String token, Long raterAssignmentId) {
        Resolved r = resolve(token);
        M360RaterAssignment rater = findOwnedRater(r, raterAssignmentId);
        if ("SYSTEM".equals(rater.getAddedBy())) {
            throw new BusinessRuleException("Self and Manager raters cannot be removed.");
        }
        raterRepository.delete(rater);
        return buildView(r);
    }

    @Transactional
    public SelectionViewDTO updateRaterRelationship(String token, Long raterAssignmentId, String relationship) {
        Resolved r = resolve(token);
        M360RaterAssignment rater = findOwnedRater(r, raterAssignmentId);
        if ("SYSTEM".equals(rater.getAddedBy())) {
            throw new BusinessRuleException("Self and Manager relationships cannot be changed.");
        }
        rater.setRelationship(relationship);
        raterRepository.save(rater);
        return buildView(r);
    }

    /** Participant submits their selection → manager notified for approval. */
    @Transactional
    public SelectionViewDTO submitSelection(String token) {
        Resolved r = resolve(token);
        validateMinimums(r);
        r.enrollment.setStatus("RATERS_SUBMITTED");
        r.enrollment.setRatersSubmittedAt(LocalDateTime.now());
        enrollmentRepository.save(r.enrollment);

        if (r.enrollment.getManagerEmail() != null) {
            Map<String, String> data = baseMergeData(r);
            data.put("approval_link", "http://localhost:5200/m360/approval/" + r.enrollment.getManagerToken());
            sendByTemplateName("360-T5", r.enrollment.getManagerEmail(), data);
        }
        return buildView(r);
    }

    @Transactional
    public SelectionViewDTO approveRater(String token, Long raterAssignmentId) {
        Resolved r = requireManager(token);
        M360RaterAssignment rater = findOwnedRater(r, raterAssignmentId);
        rater.setStatus("APPROVED");
        rater.setRejectionReason(null);
        raterRepository.save(rater);
        return buildView(r);
    }

    @Transactional
    public SelectionViewDTO rejectRater(String token, Long raterAssignmentId, String reason) {
        Resolved r = requireManager(token);
        if (reason == null || reason.isBlank()) {
            throw new BusinessRuleException("A rejection reason is required.");
        }
        M360RaterAssignment rater = findOwnedRater(r, raterAssignmentId);
        if ("SYSTEM".equals(rater.getAddedBy())) {
            throw new BusinessRuleException("Self and Manager raters cannot be rejected.");
        }
        rater.setStatus("REJECTED");
        rater.setRejectionReason(reason.trim());
        raterRepository.save(rater);
        return buildView(r);
    }

    /**
     * Manager completes the review. If any raters were rejected, selection goes back
     * to the participant (RATERS need changes → 360-T7). Otherwise all approved raters
     * are invited to give feedback (360-T8) and the enrollment moves on.
     */
    @Transactional
    public SelectionViewDTO completeApproval(String token) {
        Resolved r = requireManager(token);
        List<M360RaterAssignment> raters =
                raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId());

        boolean anyPending = raters.stream().anyMatch(x -> "PENDING_APPROVAL".equals(x.getStatus()));
        if (anyPending) {
            throw new BusinessRuleException("All raters must be approved or rejected before completing the review.");
        }

        boolean anyRejected = raters.stream().anyMatch(x -> "REJECTED".equals(x.getStatus()));
        if (anyRejected) {
            r.enrollment.setStatus("ENROLLED");
            enrollmentRepository.save(r.enrollment);
            Participant subject = participantRepository.findById(r.enrollment.getParticipantId()).orElse(null);
            if (subject != null) {
                Map<String, String> data = baseMergeData(r);
                String reasons = raters.stream()
                        .filter(x -> "REJECTED".equals(x.getStatus()))
                        .map(x -> x.getRaterName() + ": " + x.getRejectionReason())
                        .collect(Collectors.joining("; "));
                data.put("rejection_reason", reasons);
                data.put("selection_link", "http://localhost:5200/m360/rater-selection/" + r.enrollment.getParticipantToken());
                sendByTemplateName("360-T7", subject.getEmail(), data);
            }
        } else {
            r.enrollment.setStatus("RATERS_APPROVED");
            r.enrollment.setRatersApprovedAt(LocalDateTime.now());
            enrollmentRepository.save(r.enrollment);

            for (M360RaterAssignment rater : raters) {
                if (!"APPROVED".equals(rater.getStatus())) continue;
                rater.setStatus("INVITED");
                if (rater.getFeedbackToken() == null) {
                    rater.setFeedbackToken(UUID.randomUUID().toString());
                }
                rater.setInvitedAt(LocalDateTime.now());
                Map<String, String> data = baseMergeData(r);
                data.put("rater_name", rater.getRaterName());
                data.put("relationship", rater.getRelationship());
                data.put("feedback_link", "http://localhost:5200/m360/feedback/" + rater.getFeedbackToken());
                boolean sent = sendByTemplateName("360-T8", rater.getRaterEmail(), data);
                rater.setEmailStatus(sent ? "SENT" : "FAILED");
                emailTemplateRepository.findByName("360-T8")
                        .ifPresent(t -> rater.setEmailTemplateId(t.getTemplateId()));
                raterRepository.save(rater);
            }
        }
        return buildView(r);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private static class Resolved {
        M360Enrollment enrollment;
        M360Cycle cycle;
        boolean isManager;
    }

    private Resolved resolve(String token) {
        Resolved r = new Resolved();
        M360Enrollment byParticipant = enrollmentRepository.findByParticipantToken(token).orElse(null);
        if (byParticipant != null) {
            r.enrollment = byParticipant;
            r.isManager = false;
        } else {
            r.enrollment = enrollmentRepository.findByManagerToken(token)
                    .orElseThrow(() -> new ResourceNotFoundException("M360 token", token));
            r.isManager = true;
        }
        r.cycle = cycleRepository.findById(r.enrollment.getCycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", r.enrollment.getCycleId()));
        return r;
    }

    private Resolved requireManager(String token) {
        Resolved r = resolve(token);
        if (!r.isManager) {
            throw new BusinessRuleException("Only the manager can perform this action.");
        }
        return r;
    }

    private M360RaterAssignment findOwnedRater(Resolved r, Long raterAssignmentId) {
        M360RaterAssignment rater = raterRepository.findById(raterAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rater assignment", raterAssignmentId));
        if (!rater.getEnrollmentId().equals(r.enrollment.getEnrollmentId())) {
            throw new BusinessRuleException("Rater does not belong to this review.");
        }
        return rater;
    }

    /** Auto-add SELF and MANAGER rows on first load when the cycle criteria auto_load them. */
    private void autoLoadDefaults(Resolved r) {
        List<M360RaterAssignment> existing =
                raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId());
        Participant subject = participantRepository.findById(r.enrollment.getParticipantId()).orElse(null);
        if (subject == null) return;

        boolean hasSelf = existing.stream().anyMatch(x -> "SELF".equals(x.getRelationship()));
        boolean hasManager = existing.stream().anyMatch(x -> "MANAGER".equals(x.getRelationship()));

        boolean autoSelf = r.cycle.getCriteria().stream()
                .anyMatch(c -> "SELF".equals(c.getCategory()) && Boolean.TRUE.equals(c.getAutoLoad()));
        boolean autoManager = r.cycle.getCriteria().stream()
                .anyMatch(c -> "MANAGER".equals(c.getCategory()) && Boolean.TRUE.equals(c.getAutoLoad()));

        if (!hasSelf && autoSelf) {
            M360RaterAssignment self = new M360RaterAssignment();
            self.setEnrollmentId(r.enrollment.getEnrollmentId());
            self.setRaterParticipantId(subject.getParticipantId());
            self.setRaterName(subject.getFullName());
            self.setRaterEmail(subject.getEmail());
            self.setRelationship("SELF");
            self.setAddedBy("SYSTEM");
            self.setStatus("APPROVED");
            raterRepository.save(self);
        }
        if (!hasManager && autoManager && r.enrollment.getManagerName() != null) {
            M360RaterAssignment manager = new M360RaterAssignment();
            manager.setEnrollmentId(r.enrollment.getEnrollmentId());
            manager.setRaterName(r.enrollment.getManagerName());
            manager.setRaterEmail(r.enrollment.getManagerEmail() != null
                    ? r.enrollment.getManagerEmail()
                    : r.enrollment.getManagerName().toLowerCase().replace(" ", ".") + "@newco.example.com");
            manager.setRelationship("MANAGER");
            manager.setAddedBy("SYSTEM");
            manager.setStatus("APPROVED");
            raterRepository.save(manager);
        }
    }

    private void enforceMaxLimits(Resolved r, String relationship) {
        List<M360RaterAssignment> raters =
                raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId());
        long activeTotal = raters.stream().filter(x -> !"REJECTED".equals(x.getStatus())).count();
        Integer overallMax = r.cycle.getOverallMaxRaters();
        if (overallMax != null && activeTotal >= overallMax) {
            throw new BusinessRuleException("Overall rater limit of " + overallMax + " reached.");
        }
        r.cycle.getCriteria().stream()
                .filter(c -> c.getCategory().equals(relationship) && c.getMaxCount() != null)
                .findFirst()
                .ifPresent(c -> {
                    long count = raters.stream()
                            .filter(x -> relationship.equals(x.getRelationship()) && !"REJECTED".equals(x.getStatus()))
                            .count();
                    if (count >= c.getMaxCount()) {
                        throw new BusinessRuleException(
                                "Maximum of " + c.getMaxCount() + " raters reached for " + relationship + ".");
                    }
                });
    }

    private void validateMinimums(Resolved r) {
        List<M360RaterAssignment> raters =
                raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId());
        long activeTotal = raters.stream().filter(x -> !"REJECTED".equals(x.getStatus())).count();
        Integer overallMin = r.cycle.getOverallMinRaters();
        if (overallMin != null && activeTotal < overallMin) {
            throw new BusinessRuleException(
                    "Insufficient raters: at least " + overallMin + " raters are required (you have " + activeTotal + ").");
        }
        for (M360RaterCriteria c : r.cycle.getCriteria()) {
            if (c.getMinCount() == null || c.getMinCount() == 0) continue;
            long count = raters.stream()
                    .filter(x -> c.getCategory().equals(x.getRelationship()) && !"REJECTED".equals(x.getStatus()))
                    .count();
            if (count < c.getMinCount()) {
                throw new BusinessRuleException("Insufficient raters: " + c.getCategory()
                        + " requires at least " + c.getMinCount() + ".");
            }
        }
    }

    private Map<String, String> baseMergeData(Resolved r) {
        Map<String, String> data = new HashMap<>();
        data.put("cycle_name", r.cycle.getName());
        data.put("manager_name", r.enrollment.getManagerName() != null ? r.enrollment.getManagerName() : "Manager");
        participantRepository.findById(r.enrollment.getParticipantId())
                .ifPresent(p -> data.put("participant_name", p.getFullName()));
        data.put("due_date", r.cycle.getPhases().stream()
                .filter(p -> "RATER_FEEDBACK".equals(p.getPhaseType()) && p.getEndAt() != null)
                .findFirst().map(p -> p.getEndAt().toLocalDate().toString()).orElse(""));
        return data;
    }

    private boolean sendByTemplateName(String templateName, String toEmail, Map<String, String> mergeData) {
        return emailTemplateRepository.findByName(templateName)
                .map(t -> emailSendingService.sendTemplate(t.getTemplateId(), toEmail, mergeData))
                .orElseGet(() -> {
                    log.warn("Email template {} not found — skipping send to {}", templateName, toEmail);
                    return false;
                });
    }

    private SelectionViewDTO buildView(Resolved r) {
        SelectionViewDTO view = new SelectionViewDTO();
        view.setEnrollmentId(r.enrollment.getEnrollmentId());
        view.setCycleId(r.cycle.getCycleId());
        view.setCycleName(r.cycle.getName());
        view.setMode(r.isManager ? "APPROVE" : "SELECT");
        view.setParticipantId(r.enrollment.getParticipantId());
        view.setEnrollmentStatus(r.enrollment.getStatus());
        view.setOverallMinRaters(r.cycle.getOverallMinRaters());
        view.setOverallMaxRaters(r.cycle.getOverallMaxRaters());
        view.setReviewLabel("Review 1");

        participantRepository.findById(r.enrollment.getParticipantId()).ifPresent(p -> {
            view.setParticipantName(p.getFullName());
            view.setParticipantTitle(p.getTrainingProgram());
            view.setParticipantOrg(p.getLineOfBusiness());
        });

        String windowPhase = r.isManager ? "RATER_APPROVAL" : "RATER_SELECTION";
        r.cycle.getPhases().stream()
                .filter(p -> windowPhase.equals(p.getPhaseType()))
                .findFirst()
                .ifPresent(p -> {
                    view.setWindowStartAt(p.getStartAt());
                    view.setWindowEndAt(p.getEndAt());
                    view.setDueDate(p.getEndAt());
                });

        view.setCriteria(r.cycle.getCriteria().stream().map(c -> {
            CriteriaDTO cd = new CriteriaDTO();
            cd.setCriteriaId(c.getCriteriaId());
            cd.setCategory(c.getCategory());
            cd.setMinCount(c.getMinCount());
            cd.setMaxCount(c.getMaxCount());
            cd.setAutoLoad(c.getAutoLoad());
            cd.setIsEnabled(c.getIsEnabled());
            return cd;
        }).collect(Collectors.toList()));

        view.setRaters(raterRepository
                .findByEnrollmentIdOrderByRaterAssignmentIdAsc(r.enrollment.getEnrollmentId()).stream()
                .map(this::toRaterDTO)
                .collect(Collectors.toList()));
        return view;
    }

    private M360RaterDTO toRaterDTO(M360RaterAssignment rater) {
        M360RaterDTO dto = new M360RaterDTO();
        dto.setRaterAssignmentId(rater.getRaterAssignmentId());
        dto.setRaterParticipantId(rater.getRaterParticipantId());
        dto.setRaterName(rater.getRaterName());
        dto.setRaterEmail(rater.getRaterEmail());
        dto.setRelationship(rater.getRelationship());
        dto.setAddedBy(rater.getAddedBy());
        dto.setAddedByName("SYSTEM".equals(rater.getAddedBy()) ? "System" : rater.getAddedBy());
        dto.setStatus(rater.getStatus());
        dto.setRejectionReason(rater.getRejectionReason());
        dto.setInvitedAt(rater.getInvitedAt());
        dto.setFeedbackSubmittedAt(rater.getFeedbackSubmittedAt());
        return dto;
    }
}

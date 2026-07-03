package com.teammatevoices.service;

import com.teammatevoices.dto.M360CycleDTO;
import com.teammatevoices.dto.M360CycleDTO.ActivityDTO;
import com.teammatevoices.dto.M360CycleDTO.CriteriaDTO;
import com.teammatevoices.dto.M360CycleDTO.PhaseDTO;
import com.teammatevoices.dto.M360EnrollmentDTO;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.*;
import com.teammatevoices.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class M360CycleService {

    private static final Logger log = LoggerFactory.getLogger(M360CycleService.class);

    private final M360CycleRepository cycleRepository;
    private final M360EnrollmentRepository enrollmentRepository;
    private final M360RaterAssignmentRepository raterRepository;
    private final ParticipantRepository participantRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final SurveyRepository surveyRepository;
    private final WorkflowAuditLogRepository auditRepository;

    public M360CycleService(M360CycleRepository cycleRepository,
                            M360EnrollmentRepository enrollmentRepository,
                            M360RaterAssignmentRepository raterRepository,
                            ParticipantRepository participantRepository,
                            EmailTemplateRepository emailTemplateRepository,
                            SurveyRepository surveyRepository,
                            WorkflowAuditLogRepository auditRepository) {
        this.cycleRepository = cycleRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.raterRepository = raterRepository;
        this.participantRepository = participantRepository;
        this.emailTemplateRepository = emailTemplateRepository;
        this.surveyRepository = surveyRepository;
        this.auditRepository = auditRepository;
    }

    /** Full audit trail for a cycle: scheduler actions on the cycle + all enrollment transitions. */
    @Transactional(readOnly = true)
    public List<WorkflowAuditLog> getAuditTrail(Long cycleId) {
        findCycle(cycleId);
        List<WorkflowAuditLog> trail = new java.util.ArrayList<>(
                auditRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("M360_CYCLE", cycleId));
        for (M360Enrollment e : enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycleId)) {
            trail.addAll(auditRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                    "M360_ENROLLMENT", e.getEnrollmentId()));
        }
        trail.sort(Comparator.comparing(WorkflowAuditLog::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return trail;
    }

    @Transactional(readOnly = true)
    public List<M360CycleDTO> getCyclesForProgram(Long programId) {
        List<M360Cycle> cycles = programId != null
                ? cycleRepository.findByProgramIdOrderByCycleIdAsc(programId)
                : cycleRepository.findAll();
        return cycles.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public M360CycleDTO getCycle(Long cycleId) {
        return toDTO(findCycle(cycleId));
    }

    @Transactional
    public M360CycleDTO createCycle(M360CycleDTO dto) {
        log.info("Creating M360 cycle: {}", dto.getName());
        M360Cycle cycle = new M360Cycle();
        cycle.setProgramId(dto.getProgramId());
        cycle.setSurveyId(dto.getSurveyId());
        cycle.setName(dto.getName());
        cycle.setDescription(dto.getDescription());
        cycle.setVersion(1);
        cycle.setStartDate(dto.getStartDate());
        cycle.setStatus(dto.getStatus() != null ? dto.getStatus() : "INACTIVE");
        applyEnrollmentConfig(cycle, dto);
        return toDTO(cycleRepository.save(cycle));
    }

    @Transactional
    public M360CycleDTO updateCycle(Long cycleId, M360CycleDTO dto) {
        log.info("Updating M360 cycle: {}", cycleId);
        M360Cycle cycle = findCycle(cycleId);
        if (dto.getName() != null) cycle.setName(dto.getName());
        cycle.setDescription(dto.getDescription());
        if (dto.getSurveyId() != null) cycle.setSurveyId(dto.getSurveyId());
        if (dto.getStartDate() != null) cycle.setStartDate(dto.getStartDate());
        if (dto.getStatus() != null) cycle.setStatus(dto.getStatus());
        applyEnrollmentConfig(cycle, dto);
        return toDTO(cycleRepository.save(cycle));
    }

    private void applyEnrollmentConfig(M360Cycle cycle, M360CycleDTO dto) {
        if (dto.getAllowSelfSelection() != null) cycle.setAllowSelfSelection(dto.getAllowSelfSelection());
        if (dto.getAllowManagerSelection() != null) cycle.setAllowManagerSelection(dto.getAllowManagerSelection());
        if (dto.getAllowHrSelection() != null) cycle.setAllowHrSelection(dto.getAllowHrSelection());
        if (dto.getOverallMinRaters() != null) cycle.setOverallMinRaters(dto.getOverallMinRaters());
        if (dto.getOverallMaxRaters() != null) cycle.setOverallMaxRaters(dto.getOverallMaxRaters());
    }

    /** Replace the full phase schedule (Schedule step Save). */
    @Transactional
    public M360CycleDTO savePhases(Long cycleId, List<PhaseDTO> phaseDtos) {
        log.info("Saving phases for cycle {}", cycleId);
        M360Cycle cycle = findCycle(cycleId);
        cycle.getPhases().clear();
        // Flush orphan deletes before re-inserting the same phase types (UQ cycle_id+phase_type)
        cycleRepository.saveAndFlush(cycle);
        if (phaseDtos != null) {
            for (PhaseDTO p : phaseDtos) {
                M360CyclePhase phase = new M360CyclePhase();
                phase.setCycle(cycle);
                phase.setPhaseType(p.getPhaseType());
                phase.setIsEnabled(p.getIsEnabled() != null ? p.getIsEnabled() : true);
                phase.setStartAt(p.getStartAt());
                phase.setEndAt(p.getEndAt());
                if (p.getTimezone() != null) phase.setTimezone(p.getTimezone());
                if (p.getActivities() != null) {
                    int order = 0;
                    for (ActivityDTO a : p.getActivities()) {
                        M360PhaseActivity activity = new M360PhaseActivity();
                        activity.setPhase(phase);
                        activity.setActivityName(a.getActivityName());
                        activity.setEmailTemplateId(a.getEmailTemplateId());
                        activity.setActivityDate(a.getActivityDate());
                        activity.setActivityTime(a.getActivityTime());
                        activity.setIsEnabled(a.getIsEnabled() != null ? a.getIsEnabled() : true);
                        activity.setSortOrder(a.getSortOrder() != null ? a.getSortOrder() : order);
                        order++;
                        phase.getActivities().add(activity);
                    }
                }
                cycle.getPhases().add(phase);
            }
        }
        return toDTO(cycleRepository.save(cycle));
    }

    /** Replace rater criteria (Enrollment step Save). */
    @Transactional
    public M360CycleDTO saveCriteria(Long cycleId, List<CriteriaDTO> criteriaDtos) {
        log.info("Saving criteria for cycle {}", cycleId);
        M360Cycle cycle = findCycle(cycleId);
        cycle.getCriteria().clear();
        // Flush orphan deletes before re-inserting the same categories (UQ cycle_id+category)
        cycleRepository.saveAndFlush(cycle);
        if (criteriaDtos != null) {
            for (CriteriaDTO c : criteriaDtos) {
                M360RaterCriteria criteria = new M360RaterCriteria();
                criteria.setCycle(cycle);
                criteria.setCategory(c.getCategory());
                criteria.setMinCount(c.getMinCount());
                criteria.setMaxCount(c.getMaxCount());
                criteria.setAutoLoad(Boolean.TRUE.equals(c.getAutoLoad()));
                criteria.setIsEnabled(c.getIsEnabled() != null ? c.getIsEnabled() : true);
                cycle.getCriteria().add(criteria);
            }
        }
        return toDTO(cycleRepository.save(cycle));
    }

    /** Duplicate: "Duplicate-<name>", version suffix, no participants, Inactive. */
    @Transactional
    public M360CycleDTO duplicateCycle(Long cycleId) {
        log.info("Duplicating cycle {}", cycleId);
        M360Cycle source = findCycle(cycleId);
        M360Cycle copy = new M360Cycle();
        copy.setProgramId(source.getProgramId());
        copy.setSurveyId(source.getSurveyId());
        copy.setName("Duplicate-" + source.getName());
        copy.setDescription(source.getDescription());
        copy.setVersion(source.getVersion() != null ? source.getVersion() + 1 : 2);
        copy.setStartDate(source.getStartDate());
        copy.setStatus("INACTIVE");
        copy.setAllowSelfSelection(source.getAllowSelfSelection());
        copy.setAllowManagerSelection(source.getAllowManagerSelection());
        copy.setAllowHrSelection(source.getAllowHrSelection());
        copy.setOverallMinRaters(source.getOverallMinRaters());
        copy.setOverallMaxRaters(source.getOverallMaxRaters());

        for (M360CyclePhase p : source.getPhases()) {
            M360CyclePhase phase = new M360CyclePhase();
            phase.setCycle(copy);
            phase.setPhaseType(p.getPhaseType());
            phase.setIsEnabled(p.getIsEnabled());
            phase.setStartAt(p.getStartAt());
            phase.setEndAt(p.getEndAt());
            phase.setTimezone(p.getTimezone());
            for (M360PhaseActivity a : p.getActivities()) {
                M360PhaseActivity activity = new M360PhaseActivity();
                activity.setPhase(phase);
                activity.setActivityName(a.getActivityName());
                activity.setEmailTemplateId(a.getEmailTemplateId());
                activity.setActivityDate(a.getActivityDate());
                activity.setActivityTime(a.getActivityTime());
                activity.setIsEnabled(a.getIsEnabled());
                activity.setSortOrder(a.getSortOrder());
                phase.getActivities().add(activity);
            }
            copy.getPhases().add(phase);
        }
        for (M360RaterCriteria c : source.getCriteria()) {
            M360RaterCriteria criteria = new M360RaterCriteria();
            criteria.setCycle(copy);
            criteria.setCategory(c.getCategory());
            criteria.setMinCount(c.getMinCount());
            criteria.setMaxCount(c.getMaxCount());
            criteria.setAutoLoad(c.getAutoLoad());
            criteria.setIsEnabled(c.getIsEnabled());
            copy.getCriteria().add(criteria);
        }
        return toDTO(cycleRepository.save(copy));
    }

    @Transactional
    public void deleteCycle(Long cycleId) {
        log.info("Deleting cycle {}", cycleId);
        if (!cycleRepository.existsById(cycleId)) {
            throw new ResourceNotFoundException("Cycle", cycleId);
        }
        cycleRepository.deleteById(cycleId);
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<M360EnrollmentDTO> getEnrollments(Long cycleId) {
        return enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycleId).stream()
                .map(this::toEnrollmentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<M360EnrollmentDTO> enrollParticipants(Long cycleId, List<String> participantIds) {
        log.info("Enrolling {} participants into cycle {}", participantIds.size(), cycleId);
        findCycle(cycleId);
        for (String pid : participantIds) {
            if (enrollmentRepository.existsByCycleIdAndParticipantId(cycleId, pid)) continue;
            Participant participant = participantRepository.findById(pid)
                    .orElseThrow(() -> new ResourceNotFoundException("Participant", pid));
            M360Enrollment enrollment = new M360Enrollment();
            enrollment.setCycleId(cycleId);
            enrollment.setParticipantId(pid);
            enrollment.setManagerName(participant.getManagerName());
            enrollment.setStatus("ENROLLED");
            enrollment.setParticipantToken(UUID.randomUUID().toString());
            enrollment.setManagerToken(UUID.randomUUID().toString());
            enrollmentRepository.save(enrollment);
        }
        return getEnrollments(cycleId);
    }

    @Transactional
    public void removeEnrollment(Long cycleId, Long enrollmentId) {
        M360Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", enrollmentId));
        if (!enrollment.getCycleId().equals(cycleId)) {
            throw new BusinessRuleException("Enrollment does not belong to this cycle.");
        }
        enrollmentRepository.delete(enrollment);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private M360Cycle findCycle(Long cycleId) {
        return cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", cycleId));
    }

    private M360EnrollmentDTO toEnrollmentDTO(M360Enrollment e) {
        M360EnrollmentDTO dto = new M360EnrollmentDTO();
        dto.setEnrollmentId(e.getEnrollmentId());
        dto.setCycleId(e.getCycleId());
        dto.setParticipantId(e.getParticipantId());
        participantRepository.findById(e.getParticipantId()).ifPresent(p -> {
            dto.setParticipantName(p.getFullName());
            dto.setParticipantEmail(p.getEmail());
        });
        dto.setManagerName(e.getManagerName());
        dto.setManagerEmail(e.getManagerEmail());
        dto.setStatus(e.getStatus());
        dto.setParticipantToken(e.getParticipantToken());
        dto.setManagerToken(e.getManagerToken());
        dto.setRatersSubmittedAt(e.getRatersSubmittedAt());
        dto.setRatersApprovedAt(e.getRatersApprovedAt());
        dto.setRaterCount(raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(e.getEnrollmentId()).size());
        return dto;
    }

    private M360CycleDTO toDTO(M360Cycle cycle) {
        M360CycleDTO dto = new M360CycleDTO();
        dto.setCycleId(cycle.getCycleId());
        dto.setProgramId(cycle.getProgramId());
        dto.setSurveyId(cycle.getSurveyId());
        if (cycle.getSurveyId() != null) {
            surveyRepository.findById(cycle.getSurveyId()).ifPresent(s -> dto.setSurveyTitle(s.getTitle()));
        }
        dto.setName(cycle.getName());
        dto.setDescription(cycle.getDescription());
        dto.setVersion(cycle.getVersion());
        dto.setVersionLabel(formatVersion(cycle.getVersion()));
        dto.setStartDate(cycle.getStartDate());
        dto.setStatus(cycle.getStatus());
        dto.setAllowSelfSelection(cycle.getAllowSelfSelection());
        dto.setAllowManagerSelection(cycle.getAllowManagerSelection());
        dto.setAllowHrSelection(cycle.getAllowHrSelection());
        dto.setOverallMinRaters(cycle.getOverallMinRaters());
        dto.setOverallMaxRaters(cycle.getOverallMaxRaters());
        dto.setParticipantCount(enrollmentRepository.countByCycleId(cycle.getCycleId()));
        dto.setCreatedAt(cycle.getCreatedAt());
        dto.setUpdatedAt(cycle.getUpdatedAt());

        List<PhaseDTO> phaseDtos = cycle.getPhases().stream().map(p -> {
            PhaseDTO pd = new PhaseDTO();
            pd.setPhaseId(p.getPhaseId());
            pd.setPhaseType(p.getPhaseType());
            pd.setIsEnabled(p.getIsEnabled());
            pd.setStartAt(p.getStartAt());
            pd.setEndAt(p.getEndAt());
            pd.setTimezone(p.getTimezone());
            pd.setActivities(p.getActivities().stream().map(a -> {
                ActivityDTO ad = new ActivityDTO();
                ad.setActivityId(a.getActivityId());
                ad.setActivityName(a.getActivityName());
                ad.setEmailTemplateId(a.getEmailTemplateId());
                if (a.getEmailTemplateId() != null) {
                    emailTemplateRepository.findById(a.getEmailTemplateId())
                            .ifPresent(t -> ad.setEmailTemplateName(t.getName()));
                }
                ad.setActivityDate(a.getActivityDate());
                ad.setActivityTime(a.getActivityTime());
                ad.setIsEnabled(a.getIsEnabled());
                ad.setSortOrder(a.getSortOrder());
                return ad;
            }).collect(Collectors.toList()));
            return pd;
        }).collect(Collectors.toList());
        dto.setPhases(phaseDtos);

        // Schedule range across enabled phases (shown on the Cycles table)
        cycle.getPhases().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEnabled()) && p.getStartAt() != null)
                .min(Comparator.comparing(M360CyclePhase::getStartAt))
                .ifPresent(p -> dto.setScheduleStartAt(p.getStartAt()));
        cycle.getPhases().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEnabled()) && p.getEndAt() != null)
                .max(Comparator.comparing(M360CyclePhase::getEndAt))
                .ifPresent(p -> dto.setScheduleEndAt(p.getEndAt()));

        dto.setCriteria(cycle.getCriteria().stream().map(c -> {
            CriteriaDTO cd = new CriteriaDTO();
            cd.setCriteriaId(c.getCriteriaId());
            cd.setCategory(c.getCategory());
            cd.setMinCount(c.getMinCount());
            cd.setMaxCount(c.getMaxCount());
            cd.setAutoLoad(c.getAutoLoad());
            cd.setIsEnabled(c.getIsEnabled());
            return cd;
        }).collect(Collectors.toList()));

        return dto;
    }

    private String formatVersion(Integer version) {
        int v = version != null ? version : 1;
        String base = String.format("%04d", 1);
        return v <= 1 ? base : base + "-" + v;
    }
}

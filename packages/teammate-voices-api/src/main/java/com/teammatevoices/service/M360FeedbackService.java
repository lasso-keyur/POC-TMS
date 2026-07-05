package com.teammatevoices.service;

import com.teammatevoices.dto.M360ActivityDTO;
import com.teammatevoices.dto.M360ReportDTO;
import com.teammatevoices.dto.M360ReportDTO.CategoryScore;
import com.teammatevoices.dto.M360ReportDTO.QuestionRow;
import com.teammatevoices.dto.SurveyDTO;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.*;
import com.teammatevoices.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class M360FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(M360FeedbackService.class);

    private static final Map<String, Integer> SCALE_VALUES = Map.of(
            "strongly disagree", 1,
            "disagree", 2,
            "neutral", 3,
            "agree", 4,
            "strongly agree", 5);

    private final M360RaterAssignmentRepository raterRepository;
    private final M360EnrollmentRepository enrollmentRepository;
    private final M360CycleRepository cycleRepository;
    private final ParticipantRepository participantRepository;
    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;
    private final SurveyAnswerRepository answerRepository;
    private final SurveyQuestionRepository questionRepository;
    private final SurveyService surveyService;
    private final ResponseService responseService;
    private final WorkflowAuditLogRepository auditRepository;

    public M360FeedbackService(M360RaterAssignmentRepository raterRepository,
                               M360EnrollmentRepository enrollmentRepository,
                               M360CycleRepository cycleRepository,
                               ParticipantRepository participantRepository,
                               SurveyRepository surveyRepository,
                               SurveyResponseRepository responseRepository,
                               SurveyAnswerRepository answerRepository,
                               SurveyQuestionRepository questionRepository,
                               SurveyService surveyService,
                               ResponseService responseService,
                               WorkflowAuditLogRepository auditRepository) {
        this.raterRepository = raterRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.cycleRepository = cycleRepository;
        this.participantRepository = participantRepository;
        this.surveyRepository = surveyRepository;
        this.responseRepository = responseRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.surveyService = surveyService;
        this.responseService = responseService;
        this.auditRepository = auditRepository;
    }

    /** Feedback is only accepted while the Rater Feedback phase is open (lenient when unconfigured). */
    private void requireFeedbackWindow(M360Cycle cycle) {
        cycle.getPhases().stream()
                .filter(p -> "RATER_FEEDBACK".equals(p.getPhaseType()) && Boolean.TRUE.equals(p.getIsEnabled()))
                .findFirst()
                .ifPresent(p -> {
                    LocalDateTime now = LocalDateTime.now();
                    if (p.getStartAt() != null && now.isBefore(p.getStartAt())) {
                        throw new BusinessRuleException("The feedback window has not opened yet.");
                    }
                    if (p.getEndAt() != null && now.isAfter(p.getEndAt())) {
                        throw new BusinessRuleException("The feedback window has closed.");
                    }
                });
    }

    /** Load the survey for a rater feedback token, with "you are rating X as Y" context. */
    @Transactional
    public SurveyDTO getFeedbackSurvey(String token) {
        M360RaterAssignment rater = findByToken(token);
        M360Enrollment enrollment = enrollmentRepository.findById(rater.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", rater.getEnrollmentId()));
        M360Cycle cycle = cycleRepository.findById(enrollment.getCycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", enrollment.getCycleId()));
        if (cycle.getSurveyId() == null) {
            throw new BusinessRuleException("This cycle has no survey template configured.");
        }
        if ("SUBMITTED".equals(rater.getStatus())) {
            throw new BusinessRuleException("Feedback has already been submitted for this link.");
        }
        if ("EXPIRED".equals(rater.getStatus())) {
            throw new BusinessRuleException("This feedback invitation has expired.");
        }
        requireFeedbackWindow(cycle);

        SurveyDTO survey = surveyService.getSurveyById(cycle.getSurveyId());

        Map<String, String> ctx = new HashMap<>();
        participantRepository.findById(enrollment.getParticipantId()).ifPresent(p -> {
            ctx.put("m360SubjectName", p.getFullName());
            ctx.put("participant_name", p.getFullName());
        });
        ctx.put("m360Relationship", rater.getRelationship());
        ctx.put("m360CycleName", cycle.getName());
        ctx.put("m360RaterName", rater.getRaterName());
        survey.setParticipantContext(ctx);

        if (!"IN_PROGRESS".equals(rater.getStatus())) {
            rater.setStatus("IN_PROGRESS");
            raterRepository.save(rater);
        }
        return survey;
    }

    /** Persist feedback answers as a normal survey response linked to the rater assignment. */
    @Transactional
    public Long submitFeedback(String token, Map<String, String> answers) {
        M360RaterAssignment rater = findByToken(token);
        if ("SUBMITTED".equals(rater.getStatus())) {
            throw new BusinessRuleException("Feedback has already been submitted for this link.");
        }
        if ("EXPIRED".equals(rater.getStatus())) {
            throw new BusinessRuleException("This feedback invitation has expired.");
        }
        M360Enrollment enrollment = enrollmentRepository.findById(rater.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", rater.getEnrollmentId()));
        M360Cycle cycle = cycleRepository.findById(enrollment.getCycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", enrollment.getCycleId()));
        requireFeedbackWindow(cycle);
        Survey survey = surveyRepository.findById(cycle.getSurveyId())
                .orElseThrow(() -> new ResourceNotFoundException("Survey", cycle.getSurveyId()));

        SurveyResponse response = responseService.buildResponse(survey, answers);
        response.setParticipantId(enrollment.getParticipantId());
        response.setRaterAssignmentId(rater.getRaterAssignmentId());
        // Rating answers arrive as scale labels ("Agree") — map to numbers so category averages work
        for (SurveyAnswer a : response.getAnswers()) {
            if (a.getAnswerValue() == null && a.getAnswerText() != null) {
                Integer v = SCALE_VALUES.get(a.getAnswerText().trim().toLowerCase());
                if (v != null) a.setAnswerValue(v);
            }
        }
        responseRepository.save(response);

        rater.setStatus("SUBMITTED");
        rater.setFeedbackSubmittedAt(LocalDateTime.now());
        rater.setResponseId(response.getResponseId());
        raterRepository.save(rater);

        List<M360RaterAssignment> all =
                raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(enrollment.getEnrollmentId());
        boolean allDone = all.stream()
                .filter(x -> !"REJECTED".equals(x.getStatus()))
                .allMatch(x -> "SUBMITTED".equals(x.getStatus()));
        enrollment.setStatus(allDone ? "COMPLETED" : "FEEDBACK_IN_PROGRESS");
        enrollmentRepository.save(enrollment);

        auditRepository.save(WorkflowAuditLog
                .create("M360_ENROLLMENT", enrollment.getEnrollmentId(), "FEEDBACK_SUBMITTED")
                .withStateChange("INVITED", "SUBMITTED")
                .withPerformedBy("rater-token")
                .withDetails("{\"rater\":\"" + rater.getRaterName() + "\",\"relationship\":\""
                        + rater.getRelationship() + "\",\"responseId\":" + response.getResponseId() + "}"));

        log.info("M360 feedback submitted: rater assignment {}, response {}",
                rater.getRaterAssignmentId(), response.getResponseId());
        return response.getResponseId();
    }

    /** Reporting anonymity floor: categories below this many respondents are never broken out. */
    private static final int ANONYMITY_MINIMUM = 3;
    /** Attributable by design — the subject knows who their Self and Manager scores come from. */
    private static final Set<String> ATTRIBUTABLE_CATEGORIES = Set.of("SELF", "MANAGER");
    /** Self-vs-others delta at or beyond which a question is flagged. */
    private static final double GAP_FLAG_THRESHOLD = 1.0;

    /**
     * 360 report with market-standard safeguards:
     * - categories with fewer than {@value ANONYMITY_MINIMUM} respondents (Self/Manager exempt)
     *   are folded into an aggregate "OTHERS" group; if that aggregate is still below the floor
     *   it is suppressed entirely and listed in suppressedCategories
     * - gapRows compare Self against the average of everyone else per question and classify
     *   blind spots (self ≥1.0 higher) and hidden strengths (self ≥1.0 lower)
     */
    @Transactional(readOnly = true)
    public M360ReportDTO getReport(Long cycleId, String participantId) {
        M360Cycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", cycleId));
        M360Enrollment enrollment = enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycleId).stream()
                .filter(e -> e.getParticipantId().equals(participantId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment for participant", participantId));

        M360ReportDTO report = new M360ReportDTO();
        report.setCycleId(cycleId);
        report.setCycleName(cycle.getName());
        report.setParticipantId(participantId);
        report.setAnonymityMinimum(ANONYMITY_MINIMUM);
        participantRepository.findById(participantId).ifPresent(p -> report.setParticipantName(p.getFullName()));

        Map<Long, String> questionText = new LinkedHashMap<>();
        if (cycle.getSurveyId() != null) {
            questionRepository.findBySurvey_SurveyIdOrderBySortOrder(cycle.getSurveyId())
                    .forEach(q -> questionText.put(q.getQuestionId(), q.getQuestionText()));
        }

        // Raw per-category, per-question aggregates
        record Agg(String category, Long questionId, double avg, long count) {}
        List<Agg> aggs = new ArrayList<>();
        for (Object[] row : answerRepository.aggregateM360ByEnrollment(enrollment.getEnrollmentId())) {
            if (row[2] == null) continue;
            aggs.add(new Agg((String) row[0], (Long) row[1],
                    ((Number) row[2]).doubleValue(),
                    row[3] != null ? ((Number) row[3]).longValue() : 0L));
        }

        // Respondents per category = max per-question answer count in that category
        Map<String, Long> categoryRespondents = new LinkedHashMap<>();
        for (Agg a : aggs) {
            categoryRespondents.merge(a.category(), a.count(), Math::max);
        }

        Set<String> visible = new LinkedHashSet<>();
        Set<String> belowFloor = new LinkedHashSet<>();
        categoryRespondents.forEach((category, respondents) -> {
            if (ATTRIBUTABLE_CATEGORIES.contains(category) || respondents >= ANONYMITY_MINIMUM) {
                visible.add(category);
            } else {
                belowFloor.add(category);
            }
        });

        // Fold below-floor categories into OTHERS (weighted by answer count per question)
        Map<Long, double[]> othersPerQuestion = new LinkedHashMap<>(); // questionId -> [scoreSum, count]
        long othersRespondents = 0;
        for (String category : belowFloor) {
            othersRespondents += categoryRespondents.get(category);
        }
        for (Agg a : aggs) {
            if (!belowFloor.contains(a.category())) continue;
            othersPerQuestion.computeIfAbsent(a.questionId(), k -> new double[2]);
            double[] acc = othersPerQuestion.get(a.questionId());
            acc[0] += a.avg() * a.count();
            acc[1] += a.count();
        }
        boolean othersVisible = othersRespondents >= ANONYMITY_MINIMUM;

        // Question rows: visible categories as-is, plus OTHERS when it clears the floor
        Map<String, List<QuestionRow>> byCategory = new LinkedHashMap<>();
        for (Agg a : aggs) {
            if (!visible.contains(a.category())) continue;
            QuestionRow qr = new QuestionRow();
            qr.setCategory(a.category());
            qr.setQuestionId(a.questionId());
            qr.setQuestionText(questionText.get(a.questionId()));
            qr.setAvgScore(round2(a.avg()));
            qr.setResponseCount(a.count());
            report.getQuestionRows().add(qr);
            byCategory.computeIfAbsent(a.category(), k -> new ArrayList<>()).add(qr);
        }
        if (othersVisible) {
            for (Map.Entry<Long, double[]> e : othersPerQuestion.entrySet()) {
                if (e.getValue()[1] == 0) continue;
                QuestionRow qr = new QuestionRow();
                qr.setCategory("OTHERS");
                qr.setQuestionId(e.getKey());
                qr.setQuestionText(questionText.get(e.getKey()));
                qr.setAvgScore(round2(e.getValue()[0] / e.getValue()[1]));
                qr.setResponseCount((long) e.getValue()[1]);
                report.getQuestionRows().add(qr);
                byCategory.computeIfAbsent("OTHERS", k -> new ArrayList<>()).add(qr);
            }
        } else {
            for (String category : belowFloor) {
                report.getSuppressedCategories().add(new M360ReportDTO.SuppressedCategory(
                        category, categoryRespondents.get(category), ANONYMITY_MINIMUM));
            }
        }

        byCategory.forEach((category, qRows) -> {
            double avg = qRows.stream()
                    .filter(q -> q.getAvgScore() != null)
                    .mapToDouble(QuestionRow::getAvgScore)
                    .average().orElse(0);
            long count = qRows.stream().mapToLong(QuestionRow::getResponseCount).max().orElse(0);
            report.getCategoryScores().add(new CategoryScore(category, round2(avg), count));
        });

        // Gap analysis: Self vs the average of everyone else (aggregated — anonymity-safe)
        Map<Long, Double> selfByQuestion = new LinkedHashMap<>();
        Map<Long, double[]> othersAll = new LinkedHashMap<>(); // every non-SELF response, incl. below-floor
        for (Agg a : aggs) {
            if ("SELF".equals(a.category())) {
                selfByQuestion.put(a.questionId(), a.avg());
            } else {
                othersAll.computeIfAbsent(a.questionId(), k -> new double[2]);
                double[] acc = othersAll.get(a.questionId());
                acc[0] += a.avg() * a.count();
                acc[1] += a.count();
            }
        }
        for (Long questionId : questionText.keySet()) {
            Double self = selfByQuestion.get(questionId);
            double[] others = othersAll.get(questionId);
            if (self == null || others == null || others[1] < ANONYMITY_MINIMUM) continue;
            double othersAvg = others[0] / others[1];
            double delta = self - othersAvg;
            M360ReportDTO.GapRow gap = new M360ReportDTO.GapRow();
            gap.setQuestionId(questionId);
            gap.setQuestionText(questionText.get(questionId));
            gap.setSelfScore(round2(self));
            gap.setOthersAvg(round2(othersAvg));
            gap.setDelta(round2(delta));
            gap.setClassification(delta >= GAP_FLAG_THRESHOLD ? "BLIND_SPOT"
                    : delta <= -GAP_FLAG_THRESHOLD ? "HIDDEN_STRENGTH" : "ALIGNED");
            report.getGapRows().add(gap);
        }

        return report;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    /** Dashboard activity rows across all cycles (admin demo view — no auth). */
    @Transactional(readOnly = true)
    public List<M360ActivityDTO> getActivities() {
        List<M360ActivityDTO> activities = new ArrayList<>();

        for (M360Cycle cycle : cycleRepository.findAll()) {
            String surveyName = cycle.getSurveyId() != null
                    ? surveyRepository.findById(cycle.getSurveyId()).map(Survey::getTitle).orElse("360 Survey")
                    : "360 Survey";
            LocalDateTime selectionDue = phaseEnd(cycle, "RATER_SELECTION");
            LocalDateTime approvalDue = phaseEnd(cycle, "RATER_APPROVAL");
            LocalDateTime feedbackDue = phaseEnd(cycle, "RATER_FEEDBACK");

            for (M360Enrollment e : enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycle.getCycleId())) {
                String participantName = participantRepository.findById(e.getParticipantId())
                        .map(Participant::getFullName).orElse(e.getParticipantId());
                List<M360RaterAssignment> raters =
                        raterRepository.findByEnrollmentIdOrderByRaterAssignmentIdAsc(e.getEnrollmentId());

                if ("ENROLLED".equals(e.getStatus())) {
                    M360ActivityDTO a = new M360ActivityDTO();
                    a.setActivity("Select Raters for your Manager 360 Review");
                    a.setSurveyName(surveyName);
                    a.setCycleName(cycle.getName());
                    a.setParticipantName(participantName);
                    a.setMyRole("Self");
                    a.setDueDate(selectionDue);
                    long active = raters.stream().filter(x -> !"REJECTED".equals(x.getStatus())).count();
                    boolean insufficient = cycle.getOverallMinRaters() != null && active < cycle.getOverallMinRaters();
                    a.setStatus(insufficient && active > 0 ? "Insufficient raters" : (active > 0 ? "In progress" : "Not started"));
                    a.setLinkPath("/m360/rater-selection/" + e.getParticipantToken());
                    activities.add(a);
                }

                if ("RATERS_SUBMITTED".equals(e.getStatus())) {
                    M360ActivityDTO a = new M360ActivityDTO();
                    a.setActivity("Approve Raters for your employee's 360 Review");
                    a.setSurveyName(surveyName);
                    a.setCycleName(cycle.getName());
                    a.setParticipantName(participantName);
                    a.setMyRole("Manager");
                    a.setDueDate(approvalDue);
                    a.setStatus("Not started");
                    a.setLinkPath("/m360/approval/" + e.getManagerToken());
                    activities.add(a);
                }

                for (M360RaterAssignment rater : raters) {
                    if ("INVITED".equals(rater.getStatus()) || "IN_PROGRESS".equals(rater.getStatus())
                            || "SUBMITTED".equals(rater.getStatus())) {
                        M360ActivityDTO a = new M360ActivityDTO();
                        a.setActivity("Provide 360 feedback for " + participantName);
                        a.setSurveyName(surveyName);
                        a.setCycleName(cycle.getName());
                        a.setParticipantName(rater.getRaterName());
                        a.setMyRole(prettyRelationship(rater.getRelationship()));
                        a.setDueDate(feedbackDue);
                        boolean done = "SUBMITTED".equals(rater.getStatus());
                        a.setStatus(done ? "Completed" : ("IN_PROGRESS".equals(rater.getStatus()) ? "In progress" : "Not started"));
                        a.setCompleted(done);
                        a.setLinkPath("/m360/feedback/" + rater.getFeedbackToken());
                        activities.add(a);
                    }
                }

                if ("COMPLETED".equals(e.getStatus())) {
                    M360ActivityDTO a = new M360ActivityDTO();
                    a.setActivity("360 Report is ready for review");
                    a.setSurveyName(surveyName);
                    a.setCycleName(cycle.getName());
                    a.setParticipantName(participantName);
                    a.setMyRole("Manager");
                    a.setDueDate(phaseEnd(cycle, "REPORT_DELIVERY"));
                    a.setStatus("Not started");
                    a.setLinkPath("/m360/report/" + cycle.getCycleId() + "/" + e.getParticipantId());
                    activities.add(a);
                }
            }
        }
        return activities;
    }

    /** Available reports for the dashboard: one row per COMPLETED enrollment. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableReports() {
        List<Map<String, Object>> reports = new ArrayList<>();
        for (M360Cycle cycle : cycleRepository.findAll()) {
            String surveyName = cycle.getSurveyId() != null
                    ? surveyRepository.findById(cycle.getSurveyId()).map(Survey::getTitle).orElse("360 Survey")
                    : "360 Survey";
            for (M360Enrollment e : enrollmentRepository.findByCycleIdOrderByEnrollmentIdAsc(cycle.getCycleId())) {
                if (!"COMPLETED".equals(e.getStatus())) continue;
                String participantName = participantRepository.findById(e.getParticipantId())
                        .map(Participant::getFullName).orElse(e.getParticipantId());
                Map<String, Object> row = new HashMap<>();
                row.put("report", "Manager 360 Report for " + participantName + " is ready for review");
                row.put("surveyName", surveyName);
                row.put("cycleName", cycle.getName());
                row.put("datePublished", e.getUpdatedAt());
                row.put("linkPath", "/m360/report/" + cycle.getCycleId() + "/" + e.getParticipantId());
                reports.add(row);
            }
        }
        return reports;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private M360RaterAssignment findByToken(String token) {
        return raterRepository.findByFeedbackToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback token", token));
    }

    private LocalDateTime phaseEnd(M360Cycle cycle, String phaseType) {
        return cycle.getPhases().stream()
                .filter(p -> phaseType.equals(p.getPhaseType()))
                .map(M360CyclePhase::getEndAt)
                .filter(Objects::nonNull)
                .findFirst().orElse(null);
    }

    private String prettyRelationship(String relationship) {
        if (relationship == null) return "";
        return switch (relationship) {
            case "SELF" -> "Self";
            case "MANAGER" -> "Manager";
            case "INDIRECT_MANAGER" -> "Indirect manager";
            case "PEERS" -> "Peer";
            case "DIRECT_REPORTS" -> "Direct report";
            case "BUSINESS_PARTNERS" -> "Business partner";
            default -> relationship;
        };
    }
}

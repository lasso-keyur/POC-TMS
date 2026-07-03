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

    public M360FeedbackService(M360RaterAssignmentRepository raterRepository,
                               M360EnrollmentRepository enrollmentRepository,
                               M360CycleRepository cycleRepository,
                               ParticipantRepository participantRepository,
                               SurveyRepository surveyRepository,
                               SurveyResponseRepository responseRepository,
                               SurveyAnswerRepository answerRepository,
                               SurveyQuestionRepository questionRepository,
                               SurveyService surveyService,
                               ResponseService responseService) {
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
        M360Enrollment enrollment = enrollmentRepository.findById(rater.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", rater.getEnrollmentId()));
        M360Cycle cycle = cycleRepository.findById(enrollment.getCycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Cycle", enrollment.getCycleId()));
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

        log.info("M360 feedback submitted: rater assignment {}, response {}",
                rater.getRaterAssignmentId(), response.getResponseId());
        return response.getResponseId();
    }

    /** Basic 360 report: average score per rater category (+ per question breakdown). */
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
        participantRepository.findById(participantId).ifPresent(p -> report.setParticipantName(p.getFullName()));

        Map<Long, String> questionText = new HashMap<>();
        if (cycle.getSurveyId() != null) {
            questionRepository.findBySurvey_SurveyIdOrderBySortOrder(cycle.getSurveyId())
                    .forEach(q -> questionText.put(q.getQuestionId(), q.getQuestionText()));
        }

        List<Object[]> rows = answerRepository.aggregateM360ByEnrollment(enrollment.getEnrollmentId());

        Map<String, List<QuestionRow>> byCategory = new LinkedHashMap<>();
        for (Object[] row : rows) {
            QuestionRow qr = new QuestionRow();
            qr.setCategory((String) row[0]);
            qr.setQuestionId((Long) row[1]);
            qr.setQuestionText(questionText.get((Long) row[1]));
            qr.setAvgScore(row[2] != null ? ((Number) row[2]).doubleValue() : null);
            qr.setResponseCount(row[3] != null ? ((Number) row[3]).longValue() : 0L);
            report.getQuestionRows().add(qr);
            byCategory.computeIfAbsent(qr.getCategory(), k -> new ArrayList<>()).add(qr);
        }

        byCategory.forEach((category, qRows) -> {
            double avg = qRows.stream()
                    .filter(q -> q.getAvgScore() != null)
                    .mapToDouble(QuestionRow::getAvgScore)
                    .average().orElse(0);
            long count = qRows.stream().mapToLong(QuestionRow::getResponseCount).max().orElse(0);
            report.getCategoryScores().add(new CategoryScore(category, Math.round(avg * 100.0) / 100.0, count));
        });

        return report;
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

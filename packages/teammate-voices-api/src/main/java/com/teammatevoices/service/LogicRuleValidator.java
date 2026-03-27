package com.teammatevoices.service;

import com.teammatevoices.dto.LogicRuleDTO;
import com.teammatevoices.dto.LogicRuleDTO.ConditionGroup;
import com.teammatevoices.dto.LogicRuleDTO.LogicCondition;
import com.teammatevoices.dto.LogicRuleDTO.LogicAction;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.model.Survey;
import com.teammatevoices.model.SurveyQuestion;
import com.teammatevoices.repository.SurveyQuestionRepository;
import com.teammatevoices.repository.SurveyRepository;
import com.teammatevoices.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Validates logic rules before they are persisted to the database.
 *
 * This is the middleware "brain" for logic rule validation — it enforces
 * structural integrity, referential integrity, and business rules that
 * the database CLOB column cannot enforce on its own.
 *
 * Three categories of validation:
 * 1. Structural — rule has valid type, conditions, operator, action
 * 2. Referential — question/page IDs actually exist in this survey
 * 3. Business — no circular skips, no hiding required questions, etc.
 */
@Service
public class LogicRuleValidator {

    private static final Logger log = LoggerFactory.getLogger(LogicRuleValidator.class);

    private static final Set<String> VALID_RULE_TYPES = Set.of(
            "visible_if", "required_if", "skip_to", "pipe_text"
    );

    private static final Set<String> VALID_OPERATORS = Set.of(
            "equals", "not_equals", "greater_than", "less_than", "between",
            "contains", "not_contains", "is_empty", "is_not_empty", "any_of"
    );

    private static final Set<String> VALID_ACTION_TYPES = Set.of(
            "show", "hide", "require", "skip_to", "pipe"
    );

    private static final Set<String> VALID_CONDITION_OPERATORS = Set.of("AND", "OR");

    /** Allowed participant attribute names for audience-based rules */
    private static final Set<String> VALID_PARTICIPANT_FIELDS = Set.of(
            "region", "lineOfBusiness", "cohort", "participantType", "hierarchyCode"
    );

    /** Maps rule type to its allowed action types */
    private static final Map<String, Set<String>> RULE_ACTION_COMPATIBILITY = Map.of(
            "visible_if", Set.of("show", "hide"),
            "required_if", Set.of("require"),
            "skip_to", Set.of("skip_to"),
            "pipe_text", Set.of("pipe")
    );

    /** Maximum rules per survey to prevent abuse/performance issues */
    private static final int MAX_RULES_PER_SURVEY = 200;

    /** Maximum conditions per rule */
    private static final int MAX_CONDITIONS_PER_RULE = 20;

    /** Survey statuses that allow rule editing */
    private static final Set<String> EDITABLE_STATUSES = Set.of("DRAFT", "draft");

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    public LogicRuleValidator(SurveyRepository surveyRepository,
                              SurveyQuestionRepository questionRepository,
                              ObjectMapper objectMapper) {
        this.surveyRepository = surveyRepository;
        this.questionRepository = questionRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Validates all logic rules for a survey before persistence.
     *
     * Collects all errors and throws a single BusinessRuleException with
     * a combined message so the frontend can display all issues at once.
     *
     * @param surveyId the survey these rules belong to
     * @param rules    the rules to validate
     * @throws BusinessRuleException if any validation fails
     * @throws ResourceNotFoundException if survey does not exist
     */
    public void validate(Long surveyId, List<LogicRuleDTO> rules) {
        // Guard: null rules list (defensive — @Valid on DTO should catch, but belt-and-suspenders)
        if (rules == null) {
            rules = Collections.emptyList();
        }

        log.info("Validating {} logic rules for survey {}", rules.size(), surveyId);

        // Empty rule list is always valid (user cleared all rules)
        if (rules.isEmpty()) {
            return;
        }

        // Load survey context for referential checks
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", surveyId));

        List<String> errors = new ArrayList<>();

        // Gate check: survey must be in DRAFT to edit rules
        // (don't change rules on a live ACTIVE survey mid-flight)
        if (survey.getStatus() != null && !EDITABLE_STATUSES.contains(survey.getStatus())) {
            errors.add("Cannot modify logic rules: survey is '" + survey.getStatus()
                    + "'. Only DRAFT surveys can have their rules edited. "
                    + "Set the survey back to DRAFT first.");
            // Fail fast — no point validating rules if they can't be saved
            throw new BusinessRuleException("Logic rule validation failed:\n- " + errors.get(0));
        }

        // Gate check: max rules limit
        if (rules.size() > MAX_RULES_PER_SURVEY) {
            errors.add("Too many rules: " + rules.size()
                    + ". Maximum is " + MAX_RULES_PER_SURVEY + " per survey.");
            throw new BusinessRuleException("Logic rule validation failed:\n- " + errors.get(0));
        }

        // Collect valid question IDs for this survey from TWO sources:
        // 1. Database SURVEY_QUESTIONS table (numeric IDs like "1", "2", "3")
        // 2. Survey pages JSON (composite IDs like "PG-MAIN-q0", "PG-MAIN-q5")
        // The frontend uses composite IDs from the pages JSON when questions
        // are defined inline in the page builder and haven't been persisted to
        // the questions table yet.
        List<SurveyQuestion> questions = questionRepository
                .findBySurvey_SurveyIdOrderBySortOrder(surveyId);
        Set<String> validQuestionIds = questions.stream()
                .map(q -> String.valueOf(q.getQuestionId()))
                .collect(Collectors.toCollection(HashSet::new));

        // Also extract composite question IDs from pages JSON
        Set<String> validPageIds = new HashSet<>();
        extractIdsFromPagesJson(survey.getPages(), validQuestionIds, validPageIds);

        // Build map of required questions for business rule checks
        Set<String> requiredQuestionIds = questions.stream()
                .filter(q -> Boolean.TRUE.equals(q.getIsRequired()))
                .map(q -> String.valueOf(q.getQuestionId()))
                .collect(Collectors.toSet());

        // Check for duplicate rule IDs
        validateNoDuplicateRuleIds(rules, errors);

        // Check each rule
        for (int i = 0; i < rules.size(); i++) {
            LogicRuleDTO rule = rules.get(i);
            String prefix = "Rule " + (i + 1);
            if (rule.getId() != null && !rule.getId().isBlank()) {
                prefix = "Rule '" + rule.getId() + "'";
            }

            validateStructure(rule, prefix, errors);
            validateReferences(rule, prefix, validQuestionIds, validPageIds, errors);
            validateRuleActionCompatibility(rule, prefix, errors);
            validateHiddenRequiredConflict(rule, prefix, requiredQuestionIds, errors);
            validateNoDuplicateConditionQuestions(rule, prefix, errors);
            validateNoSelfSkip(rule, prefix, errors);
        }

        // Business rule: detect circular skip_to references
        validateNoCircularSkips(rules, errors);

        if (!errors.isEmpty()) {
            String message = "Logic rule validation failed:\n- " + String.join("\n- ", errors);
            log.warn("Logic validation failed for survey {}: {} errors", surveyId, errors.size());
            throw new BusinessRuleException(message);
        }

        log.info("Logic rules validated successfully for survey {}", surveyId);
    }

    /**
     * Structural validation: rule has valid type, non-empty conditions,
     * valid operators, and a non-null action.
     */
    private void validateStructure(LogicRuleDTO rule, String prefix, List<String> errors) {
        // Rule type must be valid
        if (rule.getType() == null || rule.getType().isBlank()) {
            errors.add(prefix + ": rule type is required");
        } else if (!VALID_RULE_TYPES.contains(rule.getType())) {
            errors.add(prefix + ": invalid rule type '" + rule.getType()
                    + "'. Must be one of: " + VALID_RULE_TYPES);
        }

        // Conditions must exist
        ConditionGroup conditions = rule.getConditions();
        if (conditions == null) {
            errors.add(prefix + ": conditions are required");
        } else {
            // Condition operator must be AND or OR
            if (conditions.getOperator() != null
                    && !VALID_CONDITION_OPERATORS.contains(conditions.getOperator().toUpperCase())) {
                errors.add(prefix + ": condition operator must be 'AND' or 'OR'");
            }

            // Must have at least one condition item
            if (conditions.getItems() == null || conditions.getItems().isEmpty()) {
                errors.add(prefix + ": at least one condition is required");
            } else {
                for (int j = 0; j < conditions.getItems().size(); j++) {
                    LogicCondition cond = conditions.getItems().get(j);
                    String condPrefix = prefix + ", condition " + (j + 1);

                    boolean isParticipantCond = "participant".equals(cond.getConditionType());
                    if (isParticipantCond) {
                        // Participant-based condition: validate participantField
                        if (cond.getParticipantField() == null || cond.getParticipantField().isBlank()) {
                            errors.add(condPrefix + ": participantField is required for participant conditions");
                        } else if (!VALID_PARTICIPANT_FIELDS.contains(cond.getParticipantField())) {
                            errors.add(condPrefix + ": invalid participantField '" + cond.getParticipantField()
                                    + "'. Must be one of: " + VALID_PARTICIPANT_FIELDS);
                        }
                    } else {
                        // Question-based condition: validate questionId
                        if (cond.getQuestionId() == null || cond.getQuestionId().isBlank()) {
                            errors.add(condPrefix + ": questionId is required");
                        }
                    }

                    if (cond.getOperator() == null || cond.getOperator().isBlank()) {
                        errors.add(condPrefix + ": operator is required");
                    } else if (!VALID_OPERATORS.contains(cond.getOperator())) {
                        errors.add(condPrefix + ": invalid operator '" + cond.getOperator()
                                + "'. Must be one of: " + VALID_OPERATORS);
                    }

                    // Value required for operators that compare (not is_empty/is_not_empty)
                    if (cond.getOperator() != null
                            && !cond.getOperator().equals("is_empty")
                            && !cond.getOperator().equals("is_not_empty")
                            && cond.getValue() == null) {
                        errors.add(condPrefix + ": value is required for operator '" + cond.getOperator() + "'");
                    }
                }
            }
        }

        // Action must exist and have a valid type
        LogicAction action = rule.getAction();
        if (action == null) {
            errors.add(prefix + ": action is required");
        } else if (action.getType() == null || action.getType().isBlank()) {
            errors.add(prefix + ": action type is required");
        } else if (!VALID_ACTION_TYPES.contains(action.getType())) {
            errors.add(prefix + ": invalid action type '" + action.getType()
                    + "'. Must be one of: " + VALID_ACTION_TYPES);
        }
    }

    /**
     * Referential validation: all question/page IDs referenced in
     * conditions and actions must belong to this survey.
     */
    private void validateReferences(LogicRuleDTO rule, String prefix,
                                    Set<String> validQuestionIds, Set<String> validPageIds,
                                    List<String> errors) {
        // Check condition question references (skip for participant-type conditions)
        if (rule.getConditions() != null && rule.getConditions().getItems() != null) {
            for (int j = 0; j < rule.getConditions().getItems().size(); j++) {
                LogicCondition cond = rule.getConditions().getItems().get(j);
                if ("participant".equals(cond.getConditionType())) {
                    continue; // Participant fields are validated in validateStructure
                }
                if (cond.getQuestionId() != null && !cond.getQuestionId().isBlank()
                        && !validQuestionIds.contains(cond.getQuestionId())) {
                    errors.add(prefix + ", condition " + (j + 1)
                            + ": question '" + cond.getQuestionId()
                            + "' does not exist in this survey");
                }
            }
        }

        // Check action target references
        if (rule.getAction() != null) {
            LogicAction action = rule.getAction();
            if (action.getTargetQuestionId() != null && !action.getTargetQuestionId().isBlank()
                    && !validQuestionIds.contains(action.getTargetQuestionId())) {
                errors.add(prefix + ": target question '" + action.getTargetQuestionId()
                        + "' does not exist in this survey");
            }

            // skip_to actions need a valid target (question or page)
            if ("skip_to".equals(action.getType())) {
                boolean hasQuestionTarget = action.getTargetQuestionId() != null
                        && !action.getTargetQuestionId().isBlank();
                boolean hasPageTarget = action.getTargetPageId() != null
                        && !action.getTargetPageId().isBlank();

                if (!hasQuestionTarget && !hasPageTarget) {
                    errors.add(prefix + ": skip_to action requires a target question or page");
                }

                // Validate page target exists
                if (hasPageTarget && !validPageIds.contains(action.getTargetPageId())) {
                    errors.add(prefix + ": target page '" + action.getTargetPageId()
                            + "' does not exist in this survey");
                }
            }

            // pipe action needs a pipeField
            if ("pipe".equals(action.getType())
                    && (action.getPipeField() == null || action.getPipeField().isBlank())) {
                errors.add(prefix + ": pipe action requires a pipeField");
            }
        }
    }

    /**
     * Business rule: rule type must be compatible with action type.
     * e.g., a visible_if rule can only have show/hide actions.
     */
    private void validateRuleActionCompatibility(LogicRuleDTO rule, String prefix,
                                                  List<String> errors) {
        if (rule.getType() == null || rule.getAction() == null
                || rule.getAction().getType() == null) {
            return; // Structural validation already flagged these
        }

        Set<String> allowedActions = RULE_ACTION_COMPATIBILITY.get(rule.getType());
        if (allowedActions != null && !allowedActions.contains(rule.getAction().getType())) {
            errors.add(prefix + ": rule type '" + rule.getType()
                    + "' is not compatible with action type '" + rule.getAction().getType()
                    + "'. Allowed actions: " + allowedActions);
        }
    }

    /**
     * Business rule: a 'hide' action cannot target a required question,
     * because respondents would be unable to complete the survey.
     */
    private void validateHiddenRequiredConflict(LogicRuleDTO rule, String prefix,
                                                 Set<String> requiredQuestionIds,
                                                 List<String> errors) {
        if (rule.getAction() == null) return;

        if ("hide".equals(rule.getAction().getType())
                && rule.getAction().getTargetQuestionId() != null
                && requiredQuestionIds.contains(rule.getAction().getTargetQuestionId())) {
            errors.add(prefix + ": cannot hide required question '"
                    + rule.getAction().getTargetQuestionId()
                    + "'. Either make the question optional or use a different action");
        }
    }

    /**
     * Business rule: no two rules can have the same ID.
     * Duplicate IDs cause UI confusion and data overwrites.
     */
    private void validateNoDuplicateRuleIds(List<LogicRuleDTO> rules, List<String> errors) {
        Set<String> seenIds = new HashSet<>();
        for (LogicRuleDTO rule : rules) {
            if (rule.getId() != null && !rule.getId().isBlank()) {
                if (!seenIds.add(rule.getId())) {
                    errors.add("Duplicate rule ID '" + rule.getId()
                            + "'. Each rule must have a unique identifier.");
                }
            }
        }
    }

    /**
     * Business rule: a single rule should not have duplicate conditions
     * on the same question — this is almost always an authoring mistake
     * and produces confusing AND/OR logic.
     */
    private void validateNoDuplicateConditionQuestions(LogicRuleDTO rule, String prefix,
                                                       List<String> errors) {
        if (rule.getConditions() == null || rule.getConditions().getItems() == null) return;

        // Only flag if conditions exceed MAX_CONDITIONS_PER_RULE
        if (rule.getConditions().getItems().size() > MAX_CONDITIONS_PER_RULE) {
            errors.add(prefix + ": too many conditions (" + rule.getConditions().getItems().size()
                    + "). Maximum is " + MAX_CONDITIONS_PER_RULE + " per rule.");
        }

        Set<String> seenCondKeys = new HashSet<>();
        for (LogicCondition cond : rule.getConditions().getItems()) {
            // Key includes operator so that Q1 > 3 AND Q1 < 7 (range) is NOT flagged as duplicate.
            // Only flag when the exact same source + field + operator combination repeats —
            // that is always an authoring mistake since the value would just overwrite.
            String operator = cond.getOperator() != null ? cond.getOperator() : "";
            String condKey = "participant".equals(cond.getConditionType())
                    ? ("participant:" + (cond.getParticipantField() != null ? cond.getParticipantField() : "") + ":" + operator)
                    : ("question:" + (cond.getQuestionId() != null ? cond.getQuestionId() : "") + ":" + operator);

            // Skip incomplete conditions (empty field or question) — structural validation covers those
            boolean isIncomplete = "participant".equals(cond.getConditionType())
                    ? (cond.getParticipantField() == null || cond.getParticipantField().isBlank())
                    : (cond.getQuestionId() == null || cond.getQuestionId().isBlank());

            if (!isIncomplete && !seenCondKeys.add(condKey)) {
                String label = "participant".equals(cond.getConditionType())
                        ? "participant field '" + cond.getParticipantField() + "' with operator '" + operator + "'"
                        : "question '" + cond.getQuestionId() + "' with operator '" + operator + "'";
                errors.add(prefix + ": duplicate condition on " + label
                        + ". Combine into a single condition using 'any_of' or adjust the operator.");
            }
        }
    }

    /**
     * Business rule: a skip_to rule cannot skip to a question that is
     * referenced in its own conditions (self-skip). This creates an
     * infinite loop: answer Q1 → skip to Q1 → answer Q1 → skip to Q1...
     */
    private void validateNoSelfSkip(LogicRuleDTO rule, String prefix, List<String> errors) {
        if (!"skip_to".equals(rule.getType()) || rule.getAction() == null) return;

        String target = rule.getAction().getTargetQuestionId();
        if (target == null || target.isBlank()) return;

        if (rule.getConditions() != null && rule.getConditions().getItems() != null) {
            for (LogicCondition cond : rule.getConditions().getItems()) {
                if (target.equals(cond.getQuestionId())) {
                    errors.add(prefix + ": skip_to target '" + target
                            + "' is the same question used in the condition. "
                            + "This creates an infinite loop.");
                }
            }
        }
    }

    /**
     * Business rule: skip_to rules must not form cycles.
     * e.g., Rule A skips from Q1 to Q5, Rule B skips from Q5 to Q1 = infinite loop.
     *
     * Uses a simple graph traversal to detect cycles in the skip chain.
     */
    private void validateNoCircularSkips(List<LogicRuleDTO> rules, List<String> errors) {
        // Build adjacency map: source question -> skip target
        Map<String, Set<String>> skipGraph = new HashMap<>();

        for (LogicRuleDTO rule : rules) {
            if (!"skip_to".equals(rule.getType()) || rule.getAction() == null) continue;

            String target = rule.getAction().getTargetQuestionId();
            if (target == null || target.isBlank()) continue;

            if (rule.getConditions() != null && rule.getConditions().getItems() != null) {
                for (LogicCondition cond : rule.getConditions().getItems()) {
                    if (cond.getQuestionId() != null) {
                        skipGraph.computeIfAbsent(cond.getQuestionId(), k -> new HashSet<>())
                                .add(target);
                    }
                }
            }
        }

        // DFS cycle detection
        Set<String> visited = new HashSet<>();
        Set<String> inStack = new HashSet<>();

        for (String node : skipGraph.keySet()) {
            if (hasCycle(node, skipGraph, visited, inStack)) {
                errors.add("Circular skip detected: skip_to rules form a loop. "
                        + "Check the skip chain starting from question '" + node + "'");
                break; // One cycle error is enough
            }
        }
    }

    private boolean hasCycle(String node, Map<String, Set<String>> graph,
                             Set<String> visited, Set<String> inStack) {
        if (inStack.contains(node)) return true;
        if (visited.contains(node)) return false;

        visited.add(node);
        inStack.add(node);

        Set<String> neighbors = graph.getOrDefault(node, Collections.emptySet());
        for (String neighbor : neighbors) {
            if (hasCycle(neighbor, graph, visited, inStack)) return true;
        }

        inStack.remove(node);
        return false;
    }

    /**
     * Extracts question and page IDs from the survey's pages JSON.
     *
     * The frontend stores questions inline in the pages JSON with composite IDs
     * like "PG-MAIN-q0", "PG-WELCOME-q2". These IDs are used in logic rules
     * but don't exist in the SURVEY_QUESTIONS table. We need to accept both
     * numeric DB IDs and composite page-based IDs as valid references.
     *
     * Also extracts page IDs (e.g., "PG-MAIN", "PG-WELCOME") for skip_to targets.
     */
    @SuppressWarnings("unchecked")
    private void extractIdsFromPagesJson(String pagesJson, Set<String> questionIds, Set<String> pageIds) {
        if (pagesJson == null || pagesJson.isBlank()) return;

        try {
            List<Map<String, Object>> pages = objectMapper.readValue(
                    pagesJson, new TypeReference<List<Map<String, Object>>>() {});

            for (int pageIdx = 0; pageIdx < pages.size(); pageIdx++) {
                Map<String, Object> page = pages.get(pageIdx);

                // Extract page ID
                String pageId = (String) page.get("pageId");
                if (pageId != null) {
                    pageIds.add(pageId);
                }

                // Extract question IDs from the page's questions array
                Object questionsObj = page.get("questions");
                if (questionsObj instanceof List) {
                    List<Map<String, Object>> questions = (List<Map<String, Object>>) questionsObj;
                    for (int qIdx = 0; qIdx < questions.size(); qIdx++) {
                        Map<String, Object> q = questions.get(qIdx);

                        // Add explicit questionId if present
                        Object qId = q.get("questionId");
                        if (qId != null) {
                            questionIds.add(String.valueOf(qId));
                        }

                        // Add composite ID format: {pageId}-q{index}
                        if (pageId != null) {
                            questionIds.add(pageId + "-q" + qIdx);
                        }
                    }
                }
            }

            log.debug("Extracted {} question IDs and {} page IDs from pages JSON",
                    questionIds.size(), pageIds.size());
        } catch (Exception e) {
            log.warn("Failed to parse pages JSON for question ID extraction: {}", e.getMessage());
            // Non-fatal — we still have DB question IDs as fallback
        }
    }
}

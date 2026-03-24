package com.teammatevoices.service;

import com.teammatevoices.dto.LogicEvaluationResultDTO;
import com.teammatevoices.dto.LogicRuleDTO;
import com.teammatevoices.dto.LogicRuleDTO.ConditionGroup;
import com.teammatevoices.dto.LogicRuleDTO.LogicCondition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LogicEvaluatorService {

    private static final Logger log = LoggerFactory.getLogger(LogicEvaluatorService.class);

    public LogicEvaluationResultDTO evaluate(List<LogicRuleDTO> rules, Map<String, Object> answers) {
        log.info("Evaluating {} logic rules against {} answers", rules.size(), answers.size());

        Map<String, Boolean> visibilityMap = new HashMap<>();
        Map<String, Boolean> requiredMap = new HashMap<>();
        Map<String, String> pipedValues = new HashMap<>();
        String skipTarget = null;

        for (LogicRuleDTO rule : rules) {
            boolean conditionsMet = evaluateConditionGroup(rule.getConditions(), answers);

            switch (rule.getType()) {
                case "visible_if":
                    if (rule.getAction() != null) {
                        String targetId = resolveTarget(rule.getAction());
                        if (targetId != null) {
                            boolean show = "show".equals(rule.getAction().getType()) ? conditionsMet : !conditionsMet;
                            visibilityMap.put(targetId, show);
                        }
                    }
                    break;

                case "required_if":
                    if (rule.getAction() != null && rule.getAction().getTargetQuestionId() != null) {
                        requiredMap.put(rule.getAction().getTargetQuestionId(), conditionsMet);
                    }
                    break;

                case "skip_to":
                    if (conditionsMet && rule.getAction() != null && skipTarget == null) {
                        skipTarget = resolveTarget(rule.getAction());
                    }
                    break;

                case "pipe_text":
                    if (conditionsMet && rule.getAction() != null && rule.getAction().getPipeField() != null) {
                        String sourceQId = rule.getConditions().getItems().isEmpty()
                                ? null : rule.getConditions().getItems().get(0).getQuestionId();
                        if (sourceQId != null && answers.containsKey(sourceQId)) {
                            pipedValues.put(rule.getAction().getPipeField(), String.valueOf(answers.get(sourceQId)));
                        }
                    }
                    break;

                default:
                    log.warn("Unknown rule type: {}", rule.getType());
            }
        }

        LogicEvaluationResultDTO result = new LogicEvaluationResultDTO();
        result.setVisibilityMap(visibilityMap);
        result.setRequiredMap(requiredMap);
        result.setSkipTarget(skipTarget);
        result.setPipedValues(pipedValues);
        return result;
    }

    private boolean evaluateConditionGroup(ConditionGroup group, Map<String, Object> answers) {
        if (group == null || group.getItems() == null || group.getItems().isEmpty()) {
            return true;
        }

        boolean isAnd = "AND".equalsIgnoreCase(group.getOperator());

        for (LogicCondition condition : group.getItems()) {
            boolean result = evaluateCondition(condition, answers);
            if (isAnd && !result) return false;
            if (!isAnd && result) return true;
        }

        return isAnd;
    }

    @SuppressWarnings("unchecked")
    private boolean evaluateCondition(LogicCondition condition, Map<String, Object> answers) {
        Object answerValue = answers.get(condition.getQuestionId());
        Object expectedValue = condition.getValue();
        String op = condition.getOperator();

        switch (op) {
            case "is_empty":
                return answerValue == null || answerValue.toString().isEmpty();

            case "is_not_empty":
                return answerValue != null && !answerValue.toString().isEmpty();

            case "equals":
                return Objects.equals(toString(answerValue), toString(expectedValue));

            case "not_equals":
                return !Objects.equals(toString(answerValue), toString(expectedValue));

            case "greater_than":
                return toDouble(answerValue) > toDouble(expectedValue);

            case "less_than":
                return toDouble(answerValue) < toDouble(expectedValue);

            case "between":
                if (expectedValue instanceof List) {
                    List<?> range = (List<?>) expectedValue;
                    if (range.size() == 2) {
                        double val = toDouble(answerValue);
                        return val >= toDouble(range.get(0)) && val <= toDouble(range.get(1));
                    }
                }
                return false;

            case "contains":
                return toString(answerValue).toLowerCase().contains(toString(expectedValue).toLowerCase());

            case "not_contains":
                return !toString(answerValue).toLowerCase().contains(toString(expectedValue).toLowerCase());

            case "any_of":
                if (expectedValue instanceof List) {
                    List<String> expected = (List<String>) expectedValue;
                    String answer = toString(answerValue);
                    return expected.stream().anyMatch(e -> e.equalsIgnoreCase(answer));
                }
                return false;

            default:
                log.warn("Unknown operator: {}", op);
                return false;
        }
    }

    private String resolveTarget(LogicRuleDTO.LogicAction action) {
        if (action.getTargetQuestionId() != null) return action.getTargetQuestionId();
        if (action.getTargetPageId() != null) return action.getTargetPageId();
        return null;
    }

    private String toString(Object value) {
        return value == null ? "" : value.toString();
    }

    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}

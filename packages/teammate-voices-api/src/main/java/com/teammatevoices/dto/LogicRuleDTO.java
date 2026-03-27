package com.teammatevoices.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * DTO representing a single logic rule in a survey's configuration.
 *
 * Logic rules control survey behavior: question visibility, conditional
 * requirements, skip patterns, and text piping. Validated at the controller
 * layer via Bean Validation, and further validated by LogicRuleValidator
 * for referential and business rule checks.
 */
public class LogicRuleDTO {

    @NotBlank(message = "Rule ID is required")
    private String id;

    @NotBlank(message = "Rule type is required (visible_if, required_if, skip_to, pipe_text)")
    private String type;

    @NotNull(message = "Conditions are required")
    @Valid
    private ConditionGroup conditions;

    @NotNull(message = "Action is required")
    @Valid
    private LogicAction action;

    public LogicRuleDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public ConditionGroup getConditions() { return conditions; }
    public void setConditions(ConditionGroup conditions) { this.conditions = conditions; }

    public LogicAction getAction() { return action; }
    public void setAction(LogicAction action) { this.action = action; }

    /**
     * A group of conditions combined with AND/OR logic.
     */
    public static class ConditionGroup {

        @NotBlank(message = "Condition operator is required (AND or OR)")
        private String operator;

        @NotEmpty(message = "At least one condition is required")
        @Valid
        private List<LogicCondition> items;

        public ConditionGroup() {}

        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }

        public List<LogicCondition> getItems() { return items; }
        public void setItems(List<LogicCondition> items) { this.items = items; }
    }

    /**
     * A single condition: "when [question/participant field] [operator] [value]".
     *
     * conditionType = "question"     → questionId identifies a survey question
     * conditionType = "participant"  → participantField identifies a participant attribute
     *                                  (region, lineOfBusiness, cohort, participantType, hierarchyCode)
     */
    public static class LogicCondition {

        /**
         * "question" (default) or "participant".
         * Determines whether this condition evaluates a survey answer or a participant attribute.
         */
        private String conditionType = "question";

        /** ID of the survey question — required when conditionType = "question" */
        private String questionId;

        /**
         * Participant attribute name — required when conditionType = "participant".
         * Allowed values: region, lineOfBusiness, cohort, participantType, hierarchyCode
         */
        private String participantField;

        @NotBlank(message = "Condition operator is required")
        private String operator;

        /** Value can be String, Number, or List<String> depending on operator */
        private Object value;

        public LogicCondition() {}

        public String getConditionType() { return conditionType == null ? "question" : conditionType; }
        public void setConditionType(String conditionType) { this.conditionType = conditionType; }

        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }

        public String getParticipantField() { return participantField; }
        public void setParticipantField(String participantField) { this.participantField = participantField; }

        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }

        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
    }

    /**
     * The action taken when conditions are met: show, hide, require, skip_to, or pipe.
     */
    public static class LogicAction {

        @NotBlank(message = "Action type is required (show, hide, require, skip_to, pipe)")
        private String type;

        private String targetQuestionId;
        private String targetPageId;
        private String pipeField;

        public LogicAction() {}

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTargetQuestionId() { return targetQuestionId; }
        public void setTargetQuestionId(String targetQuestionId) { this.targetQuestionId = targetQuestionId; }

        public String getTargetPageId() { return targetPageId; }
        public void setTargetPageId(String targetPageId) { this.targetPageId = targetPageId; }

        public String getPipeField() { return pipeField; }
        public void setPipeField(String pipeField) { this.pipeField = pipeField; }
    }
}

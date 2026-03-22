package com.teammatevoices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {
    private Long questionId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Question type is required")
    private String questionType;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    private Boolean isRequired;
    private List<OptionDTO> options;
}

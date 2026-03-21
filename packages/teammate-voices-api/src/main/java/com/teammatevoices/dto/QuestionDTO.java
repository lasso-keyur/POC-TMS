package com.teammatevoices.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {
    private Long questionId;
    private String questionText;
    private String questionType;
    private Integer sortOrder;
    private Boolean isRequired;
    private List<OptionDTO> options;
}

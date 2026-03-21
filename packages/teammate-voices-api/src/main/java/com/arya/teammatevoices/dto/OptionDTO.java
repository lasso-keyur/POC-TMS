package com.arya.teammatevoices.dto;

import lombok.Data;

@Data
public class OptionDTO {
    private Long optionId;
    private String optionText;
    private Integer optionValue;
    private Integer sortOrder;
}

package com.arya.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "SURVEY_ANSWERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ANSWER_ID")
    private Long answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RESPONSE_ID", nullable = false)
    private SurveyResponse response;

    @Column(name = "QUESTION_ID", nullable = false)
    private Long questionId;

    @Column(name = "ANSWER_TEXT")
    @Lob
    private String answerText;

    @Column(name = "ANSWER_VALUE")
    private Integer answerValue;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}

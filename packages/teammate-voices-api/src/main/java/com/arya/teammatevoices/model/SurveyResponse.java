package com.arya.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SURVEY_RESPONSES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RESPONSE_ID")
    private Long responseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SURVEY_ID", nullable = false)
    private Survey survey;

    @Column(name = "RESPONDENT_USER_ID")
    private Long respondentUserId;

    @Column(name = "SUBMITTED_AT")
    private LocalDateTime submittedAt;

    @Column(name = "STARTED_AT")
    private LocalDateTime startedAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyAnswer> answers = new ArrayList<>();
}

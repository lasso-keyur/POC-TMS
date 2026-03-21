package com.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SURVEYS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SURVEY_ID")
    private Long surveyId;

    @Column(name = "TITLE", nullable = false, length = 255)
    private String title;

    @Column(name = "DESCRIPTION")
    @Lob
    private String description;

    @Column(name = "TEMPLATE_TYPE", nullable = false, length = 50)
    private String templateType = "CUSTOM";

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "PARTICIPANT_TYPE", length = 30)
    private String participantType = "ALL";

    @Column(name = "SURVEY_STAGE", length = 30)
    private String surveyStage = "ONBOARDING";

    @Column(name = "AUDIENCE_SOURCE", length = 30)
    private String audienceSource = "CSV_UPLOAD";

    @Column(name = "AUTO_SEND")
    private Boolean autoSend = false;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "IS_ANONYMOUS")
    private Boolean isAnonymous = true;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyQuestion> questions = new ArrayList<>();

    public void addQuestion(SurveyQuestion question) {
        questions.add(question);
        question.setSurvey(this);
    }

    public void removeQuestion(SurveyQuestion question) {
        questions.remove(question);
        question.setSurvey(null);
    }
}

package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "M360_PHASE_ACTIVITIES")
public class M360PhaseActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACTIVITY_ID")
    private Long activityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PHASE_ID", nullable = false)
    private M360CyclePhase phase;

    @Column(name = "ACTIVITY_NAME", nullable = false, length = 255)
    private String activityName;

    @Column(name = "EMAIL_TEMPLATE_ID")
    private Long emailTemplateId;

    @Column(name = "ACTIVITY_DATE")
    private LocalDate activityDate;

    @Column(name = "ACTIVITY_TIME", length = 20)
    private String activityTime;

    @Column(name = "IS_ENABLED")
    private Boolean isEnabled = true;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder = 0;

    @Column(name = "SENT_AT")
    private LocalDateTime sentAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360PhaseActivity() {
    }

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public M360CyclePhase getPhase() { return phase; }
    public void setPhase(M360CyclePhase phase) { this.phase = phase; }

    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }

    public Long getEmailTemplateId() { return emailTemplateId; }
    public void setEmailTemplateId(Long emailTemplateId) { this.emailTemplateId = emailTemplateId; }

    public LocalDate getActivityDate() { return activityDate; }
    public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }

    public String getActivityTime() { return activityTime; }
    public void setActivityTime(String activityTime) { this.activityTime = activityTime; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

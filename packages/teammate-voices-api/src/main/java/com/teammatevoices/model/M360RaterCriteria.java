package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "M360_RATER_CRITERIA")
public class M360RaterCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CRITERIA_ID")
    private Long criteriaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CYCLE_ID", nullable = false)
    private M360Cycle cycle;

    @Column(name = "CATEGORY", nullable = false, length = 30)
    private String category;

    @Column(name = "MIN_COUNT")
    private Integer minCount;

    @Column(name = "MAX_COUNT")
    private Integer maxCount;

    @Column(name = "AUTO_LOAD")
    private Boolean autoLoad = false;

    @Column(name = "IS_ENABLED")
    private Boolean isEnabled = true;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360RaterCriteria() {
    }

    public Long getCriteriaId() { return criteriaId; }
    public void setCriteriaId(Long criteriaId) { this.criteriaId = criteriaId; }

    public M360Cycle getCycle() { return cycle; }
    public void setCycle(M360Cycle cycle) { this.cycle = cycle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getMinCount() { return minCount; }
    public void setMinCount(Integer minCount) { this.minCount = minCount; }

    public Integer getMaxCount() { return maxCount; }
    public void setMaxCount(Integer maxCount) { this.maxCount = maxCount; }

    public Boolean getAutoLoad() { return autoLoad; }
    public void setAutoLoad(Boolean autoLoad) { this.autoLoad = autoLoad; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

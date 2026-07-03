package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "M360_CYCLE_PHASES")
public class M360CyclePhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PHASE_ID")
    private Long phaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CYCLE_ID", nullable = false)
    private M360Cycle cycle;

    @Column(name = "PHASE_TYPE", nullable = false, length = 30)
    private String phaseType;

    @Column(name = "IS_ENABLED")
    private Boolean isEnabled = true;

    @Column(name = "START_AT")
    private LocalDateTime startAt;

    @Column(name = "END_AT")
    private LocalDateTime endAt;

    @Column(name = "TIMEZONE", length = 50)
    private String timezone = "America/New_York";

    @OneToMany(mappedBy = "phase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<M360PhaseActivity> activities = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360CyclePhase() {
    }

    public Long getPhaseId() { return phaseId; }
    public void setPhaseId(Long phaseId) { this.phaseId = phaseId; }

    public M360Cycle getCycle() { return cycle; }
    public void setCycle(M360Cycle cycle) { this.cycle = cycle; }

    public String getPhaseType() { return phaseType; }
    public void setPhaseType(String phaseType) { this.phaseType = phaseType; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }

    public LocalDateTime getEndAt() { return endAt; }
    public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public List<M360PhaseActivity> getActivities() { return activities; }
    public void setActivities(List<M360PhaseActivity> activities) { this.activities = activities; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

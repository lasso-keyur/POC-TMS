package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "M360_CYCLES")
public class M360Cycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CYCLE_ID")
    private Long cycleId;

    @Column(name = "PROGRAM_ID", nullable = false)
    private Long programId;

    @Column(name = "SURVEY_ID")
    private Long surveyId;

    @Column(name = "NAME", nullable = false, length = 255)
    private String name;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "VERSION")
    private Integer version = 1;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "STATUS", length = 20)
    private String status = "INACTIVE";

    @Column(name = "ALLOW_SELF_SELECTION")
    private Boolean allowSelfSelection = true;

    @Column(name = "ALLOW_MANAGER_SELECTION")
    private Boolean allowManagerSelection = true;

    @Column(name = "ALLOW_HR_SELECTION")
    private Boolean allowHrSelection = false;

    @Column(name = "OVERALL_MIN_RATERS")
    private Integer overallMinRaters;

    @Column(name = "OVERALL_MAX_RATERS")
    private Integer overallMaxRaters;

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("phaseId ASC")
    private List<M360CyclePhase> phases = new ArrayList<>();

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("criteriaId ASC")
    private List<M360RaterCriteria> criteria = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360Cycle() {
    }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getAllowSelfSelection() { return allowSelfSelection; }
    public void setAllowSelfSelection(Boolean allowSelfSelection) { this.allowSelfSelection = allowSelfSelection; }

    public Boolean getAllowManagerSelection() { return allowManagerSelection; }
    public void setAllowManagerSelection(Boolean allowManagerSelection) { this.allowManagerSelection = allowManagerSelection; }

    public Boolean getAllowHrSelection() { return allowHrSelection; }
    public void setAllowHrSelection(Boolean allowHrSelection) { this.allowHrSelection = allowHrSelection; }

    public Integer getOverallMinRaters() { return overallMinRaters; }
    public void setOverallMinRaters(Integer overallMinRaters) { this.overallMinRaters = overallMinRaters; }

    public Integer getOverallMaxRaters() { return overallMaxRaters; }
    public void setOverallMaxRaters(Integer overallMaxRaters) { this.overallMaxRaters = overallMaxRaters; }

    public List<M360CyclePhase> getPhases() { return phases; }
    public void setPhases(List<M360CyclePhase> phases) { this.phases = phases; }

    public List<M360RaterCriteria> getCriteria() { return criteria; }
    public void setCriteria(List<M360RaterCriteria> criteria) { this.criteria = criteria; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

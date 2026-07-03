package com.teammatevoices.dto;

import java.time.LocalDateTime;

public class M360ActivityDTO {

    private String activity;
    private String surveyName;
    private String cycleName;
    private String participantName;
    private String myRole;
    private LocalDateTime dueDate;
    private String status;
    private String linkPath;
    private boolean completed;

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public String getSurveyName() { return surveyName; }
    public void setSurveyName(String surveyName) { this.surveyName = surveyName; }
    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public String getMyRole() { return myRole; }
    public void setMyRole(String myRole) { this.myRole = myRole; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLinkPath() { return linkPath; }
    public void setLinkPath(String linkPath) { this.linkPath = linkPath; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}

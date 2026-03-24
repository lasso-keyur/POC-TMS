package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "WORKFLOW_AUDIT_LOG")
public class WorkflowAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AUDIT_ID")
    private Long auditId;

    @Column(name = "ENTITY_TYPE", nullable = false, length = 50)
    private String entityType;

    @Column(name = "ENTITY_ID", nullable = false)
    private Long entityId;

    @Column(name = "ACTION", nullable = false, length = 50)
    private String action;

    @Column(name = "PREVIOUS_STATE", length = 50)
    private String previousState;

    @Column(name = "NEW_STATE", length = 50)
    private String newState;

    @Column(name = "PERFORMED_BY", length = 255)
    private String performedBy;

    @Lob
    @Column(name = "DETAILS")
    private String details;

    @Column(name = "IP_ADDRESS", length = 45)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    public WorkflowAuditLog() {}

    public static WorkflowAuditLog create(String entityType, Long entityId, String action) {
        WorkflowAuditLog log = new WorkflowAuditLog();
        log.entityType = entityType;
        log.entityId = entityId;
        log.action = action;
        return log;
    }

    public WorkflowAuditLog withStateChange(String from, String to) {
        this.previousState = from;
        this.newState = to;
        return this;
    }

    public WorkflowAuditLog withPerformedBy(String user) {
        this.performedBy = user;
        return this;
    }

    public WorkflowAuditLog withDetails(String details) {
        this.details = details;
        return this;
    }

    public WorkflowAuditLog withIpAddress(String ip) {
        this.ipAddress = ip;
        return this;
    }

    public Long getAuditId() { return auditId; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getAction() { return action; }
    public String getPreviousState() { return previousState; }
    public String getNewState() { return newState; }
    public String getPerformedBy() { return performedBy; }
    public String getDetails() { return details; }
    public String getIpAddress() { return ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

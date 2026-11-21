package com.maireposteria.users.domain.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "actor_email", nullable = false, length = 255)
    private String actorEmail;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 80)
    private String entityType;

    @Column(name = "entity_id", length = 255)
    private String entityId;

    @Column(nullable = false, length = 16)
    private String outcome;

    @Column(nullable = false, length = 300)
    private String summary;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected AdminAuditLog() {
    }

    public AdminAuditLog(String actorEmail, String action, String entityType, String entityId,
            String outcome, String summary, String requestId) {
        this.actorEmail = actorEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.outcome = outcome;
        this.summary = summary;
        this.requestId = requestId;
    }

    public UUID getId() { return id; }
    public String getActorEmail() { return actorEmail; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getOutcome() { return outcome; }
    public String getSummary() { return summary; }
    public String getRequestId() { return requestId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

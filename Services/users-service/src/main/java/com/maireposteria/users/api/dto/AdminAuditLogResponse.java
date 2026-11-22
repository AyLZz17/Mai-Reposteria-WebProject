package com.maireposteria.users.api.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.maireposteria.users.domain.entity.AdminAuditLog;

public record AdminAuditLogResponse(
        UUID id,
        String actorEmail,
        String action,
        String entityType,
        String entityId,
        String outcome,
        String summary,
        String requestId,
        OffsetDateTime createdAt
) {
    public static AdminAuditLogResponse fromEntity(AdminAuditLog event) {
        return new AdminAuditLogResponse(event.getId(), event.getActorEmail(), event.getAction(),
                event.getEntityType(), event.getEntityId(), event.getOutcome(), event.getSummary(),
                event.getRequestId(), event.getCreatedAt());
    }
}

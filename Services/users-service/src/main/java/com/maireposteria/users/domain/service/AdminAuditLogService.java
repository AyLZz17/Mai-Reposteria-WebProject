package com.maireposteria.users.domain.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.maireposteria.users.api.dto.AdminAuditEventRequest;
import com.maireposteria.users.domain.entity.AdminAuditLog;
import com.maireposteria.users.domain.repository.AdminAuditLogRepository;

@Service
public class AdminAuditLogService {
    private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("AUDIT");
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminAuditLogService.class);

    private final AdminAuditLogRepository repository;

    public AdminAuditLogService(AdminAuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public AdminAuditLog record(String actorEmail, AdminAuditEventRequest event) {
        AdminAuditLog saved = repository.save(new AdminAuditLog(actorEmail, event.action(), event.entityType(),
                event.entityId(), event.outcome(), event.summary(), event.requestId()));
        AUDIT_LOGGER.info("admin_action action={} actor={} entityType={} entityId={} outcome={} requestId={}",
                event.action(), actorEmail, event.entityType(), event.entityId(), event.outcome(), event.requestId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLog> recent(int requestedLimit) {
        int limit = Math.max(1, Math.min(requestedLimit, 100));
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    public void logWriteFailure(String action, String actorEmail, RuntimeException error) {
        LOGGER.error("Could not persist admin audit event action={} actor={}", action, actorEmail, error);
    }
}

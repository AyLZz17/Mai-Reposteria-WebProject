package com.maireposteria.users.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.maireposteria.users.api.dto.AdminAuditEventRequest;
import com.maireposteria.users.api.dto.AdminAuditLogResponse;
import com.maireposteria.users.domain.service.AdminAuditLogService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
public class AdminAuditLogController {
    private final AdminAuditLogService auditLogService;

    public AdminAuditLogController(AdminAuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/api/v1/users/audit")
    public ResponseEntity<List<AdminAuditLogResponse>> recent(
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication) {
        if (!hasRole(authentication, "SUPER_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<AdminAuditLogResponse> events = auditLogService.recent(limit).stream()
                .map(AdminAuditLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(events);
    }

    @PostMapping("/api/v1/internal/audit")
    public ResponseEntity<Void> record(
            @Valid @RequestBody AdminAuditEventRequest event,
            Authentication authentication,
            HttpServletRequest request) {
        if (!hasRole(authentication, "ADMIN") && !hasRole(authentication, "SUPER_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String actorEmail = authentication.getName();
        try {
            String requestId = event.requestId() == null || event.requestId().isBlank()
                    ? request.getHeader("X-Request-Id")
                    : event.requestId();
            AdminAuditEventRequest normalized = new AdminAuditEventRequest(event.action(), event.entityType(),
                    event.entityId(), event.outcome(), event.summary(), requestId);
            auditLogService.record(actorEmail, normalized);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException error) {
            auditLogService.logWriteFailure(event.action(), actorEmail, error);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}

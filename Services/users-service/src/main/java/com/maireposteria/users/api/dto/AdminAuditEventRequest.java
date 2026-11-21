package com.maireposteria.users.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminAuditEventRequest(
        @NotBlank @Pattern(regexp = "[A-Z][A-Z0-9_]{1,79}") String action,
        @NotBlank @Pattern(regexp = "[A-Z][A-Z0-9_]{1,79}") String entityType,
        @Size(max = 255) String entityId,
        @NotBlank @Pattern(regexp = "SUCCESS|FAILURE") String outcome,
        @NotBlank @Size(max = 300) String summary,
        @Size(max = 100) @Pattern(regexp = "[A-Za-z0-9._:-]*") String requestId
) {
}

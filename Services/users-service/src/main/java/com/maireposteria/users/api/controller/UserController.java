package com.maireposteria.users.api.controller;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.maireposteria.users.api.dto.RegisterUserRequest;
import com.maireposteria.users.api.dto.UserResponse;
import com.maireposteria.users.api.dto.AdminAuditEventRequest;
import com.maireposteria.users.domain.entity.User;
import com.maireposteria.users.domain.service.AdminAuditLogService;
import com.maireposteria.users.domain.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AdminAuditLogService auditLogService;

    public UserController(UserService userService, AdminAuditLogService auditLogService) {
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    /**
     * Endpoint para registrar un nuevo usuario con contraseña hasheada.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        User registered = userService.registerUser(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.fromEntity(registered));
    }

    /**
     * Endpoint para buscar un usuario por su ID (UUID).
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return userService.findByEmail(authentication.getName())
                .map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para buscar un usuario por su email.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getByEmail(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para verificar si un email ya existe en el sistema.
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * Endpoint para activar o desactivar un usuario.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> setStatus(
            @PathVariable UUID id,
            @RequestParam boolean active,
            Authentication authentication,
            HttpServletRequest request
    ) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            User updated = userService.setUserActiveStatus(id, active);
            String action = active ? "ACTIVATE_USER" : "DEACTIVATE_USER";
            recordAudit(authentication, request, action, updated.getId().toString(), "SUCCESS",
                    (active ? "Activó la cuenta " : "Desactivó la cuenta ") + updated.getEmail());
            return ResponseEntity.ok(UserResponse.fromEntity(updated));
        } catch (IllegalArgumentException exception) {
            String action = active ? "ACTIVATE_USER" : "DEACTIVATE_USER";
            recordAudit(authentication, request, action, id.toString(), "FAILURE", "No se encontró la cuenta " + id + ".");
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/admin-role")
    public ResponseEntity<UserResponse> promoteToAdmin(@RequestBody Map<String, String> body, Authentication authentication, HttpServletRequest request) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            recordAudit(authentication, request, "ASSIGN_ADMIN_ROLE", null, "FAILURE", "Fallo la asignación del rol ADMIN: falta el correo.");
            return ResponseEntity.badRequest().build();
        }
        try {
            User updated = userService.promoteToAdmin(email);
            recordAudit(authentication, request, "ASSIGN_ADMIN_ROLE", updated.getEmail(), "SUCCESS", "Asignó ADMIN: " + updated.getEmail());
            return ResponseEntity.ok(UserResponse.fromEntity(updated));
        } catch (IllegalArgumentException exception) {
            recordAudit(authentication, request, "ASSIGN_ADMIN_ROLE", email, "FAILURE", "Fallo la asignación de ADMIN: " + email);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/admin-role")
    public ResponseEntity<UserResponse> removeAdminRole(@RequestParam String email, Authentication authentication, HttpServletRequest request) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            User updated = userService.removeAdminRole(email);
            recordAudit(authentication, request, "REMOVE_ADMIN_ROLE", updated.getEmail(), "SUCCESS", "Quitó ADMIN: " + updated.getEmail());
            return ResponseEntity.ok(UserResponse.fromEntity(updated));
        } catch (IllegalArgumentException exception) {
            recordAudit(authentication, request, "REMOVE_ADMIN_ROLE", email, "FAILURE", "Fallo al quitar ADMIN: " + email);
            return ResponseEntity.notFound().build();
        }
    }

    private void recordAudit(Authentication authentication, HttpServletRequest request, String action,
            String entityId, String outcome, String summary) {
        String requestId = request.getHeader("X-Request-Id");
        if (requestId != null && !Pattern.matches("[A-Za-z0-9._:-]{1,100}", requestId)) requestId = null;
        AdminAuditEventRequest event = new AdminAuditEventRequest(action, "USER", entityId, outcome, summary, requestId);
        try {
            auditLogService.record(authentication.getName(), event);
        } catch (RuntimeException error) {
            auditLogService.logWriteFailure(action, authentication.getName(), error);
        }
    }
}

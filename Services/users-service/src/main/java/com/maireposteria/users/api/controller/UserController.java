package com.maireposteria.users.api.controller;

import java.util.Map;
import java.util.UUID;

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
import com.maireposteria.users.domain.entity.User;
import com.maireposteria.users.domain.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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
            @RequestParam boolean active
    ) {
        User updated = userService.setUserActiveStatus(id, active);
        return ResponseEntity.ok(UserResponse.fromEntity(updated));
    }

    @PatchMapping("/admin-role")
    public ResponseEntity<UserResponse> promoteToAdmin(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String email = body.get("email");
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().build();
        try {
            return ResponseEntity.ok(UserResponse.fromEntity(userService.promoteToAdmin(email)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/admin-role")
    public ResponseEntity<UserResponse> removeAdminRole(@RequestParam String email, Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try { return ResponseEntity.ok(UserResponse.fromEntity(userService.removeAdminRole(email))); }
        catch (IllegalArgumentException exception) { return ResponseEntity.notFound().build(); }
    }
}

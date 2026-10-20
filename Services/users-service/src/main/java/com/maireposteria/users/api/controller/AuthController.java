package com.maireposteria.users.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maireposteria.users.api.dto.AuthResponse;
import com.maireposteria.users.api.dto.GoogleLoginRequest;
import com.maireposteria.users.api.dto.LoginRequest;
import com.maireposteria.users.api.dto.RefreshTokenRequest;
import com.maireposteria.users.domain.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint para inicio de sesión local con email y contraseña.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "User-Agent", required = false, defaultValue = "Unknown") String userAgent
    ) {
        AuthResponse response = authService.login(request, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para inicio de sesión o registro automático con Google OAuth 2.0.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request,
            @RequestHeader(value = "User-Agent", required = false, defaultValue = "Unknown") String userAgent
    ) {
        AuthResponse response = authService.loginWithGoogle(request, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para renovar el par de tokens (Access Token + Refresh Token).
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            @RequestHeader(value = "User-Agent", required = false, defaultValue = "Unknown") String userAgent
    ) {
        AuthResponse response = authService.refreshToken(request, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para cerrar sesión e invalidar el refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        if (request != null && request.refreshToken() != null) {
            authService.logout(request.refreshToken());
        }
        return ResponseEntity.ok(Map.of("message", "Sesión finalizada exitosamente"));
    }
}

package com.maireposteria.users;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.maireposteria.users.api.dto.AuthResponse;
import com.maireposteria.users.api.dto.LoginRequest;
import com.maireposteria.users.domain.entity.User;
import com.maireposteria.users.domain.repository.RefreshTokenRepository;
import com.maireposteria.users.domain.repository.UserRepository;
import com.maireposteria.users.domain.service.AuthService;
import com.maireposteria.users.domain.service.UserService;

@SpringBootTest
class AuthFlowIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    @DisplayName("Debe registrar usuario, iniciar sesión y persistir en la base de datos PostgreSQL")
    void testRegisterAndLoginFlow() {
        String email = "prueba.dbeaver@maireposteria.com";
        String password = "PasswordSeguro2026!";

        // Si ya existía de una ejecución previa, limpiamos para permitir re-ejecución limpia
        userRepository.findByEmail(email).ifPresent(user -> {
            refreshTokenRepository.revokeAllUserTokens(user);
            userRepository.delete(user);
        });

        // 1. Registrar usuario con contraseña hasheada y asignación de rol CLIENTE
        User registered = userService.registerUser(email, password, "Daniel", "Repostero");
        assertNotNull(registered.getId(), "El usuario debe tener un UUID generado");
        assertNotNull(registered.getPasswordHash(), "La contraseña debe estar hasheada con BCrypt");
        assertFalse(registered.getRoles().isEmpty(), "Debe tener asignado al menos el rol CLIENTE");

        // 2. Iniciar sesión y generar par de tokens JWT (Access + Refresh)
        LoginRequest loginRequest = new LoginRequest(email, password);
        AuthResponse authResponse = authService.login(loginRequest, "DBeaver-Verification-Client/1.0");

        assertNotNull(authResponse.accessToken(), "Debe generar un Access Token JWT");
        assertNotNull(authResponse.refreshToken(), "Debe generar un Refresh Token");
        assertTrue(authResponse.user().roles().contains("CLIENTE"), "El usuario debe tener el rol CLIENTE en la respuesta");

        System.out.println("==================================================");
        System.out.println("¡USUARIO CREADO Y LOGUEADO CON ÉXITO EN POSTGRESQL!");
        System.out.println("ID Usuario: " + registered.getId());
        System.out.println("Email:      " + registered.getEmail());
        System.out.println("Roles:      " + authResponse.user().roles());
        System.out.println("Access JWT: " + authResponse.accessToken().substring(0, 35) + "...");
        System.out.println("==================================================");
    }
}

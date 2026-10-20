package com.maireposteria.users.domain.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.maireposteria.users.api.dto.AuthResponse;
import com.maireposteria.users.api.dto.GoogleLoginRequest;
import com.maireposteria.users.api.dto.LoginRequest;
import com.maireposteria.users.api.dto.RefreshTokenRequest;
import com.maireposteria.users.api.dto.UserResponse;
import com.maireposteria.users.api.exception.AuthenticationException;
import com.maireposteria.users.domain.entity.RefreshToken;
import com.maireposteria.users.domain.entity.User;
import com.maireposteria.users.domain.repository.RefreshTokenRepository;
import com.maireposteria.users.domain.repository.RoleRepository;
import com.maireposteria.users.domain.repository.UserRepository;
import com.maireposteria.users.infrastructure.security.GoogleAuthService;
import com.maireposteria.users.infrastructure.security.GoogleAuthService.GoogleUserInfo;
import com.maireposteria.users.infrastructure.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleAuthService googleAuthService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleAuthService = googleAuthService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthenticationException("Credenciales inválidas"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new AuthenticationException("La cuenta de usuario se encuentra desactivada");
        }

        if (user.getPasswordHash() == null) {
            throw new AuthenticationException("Esta cuenta fue registrada con Google. Por favor inicia sesión con Google.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationException("Credenciales inválidas");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return issueTokens(user, deviceInfo);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request, String deviceInfo) {
        GoogleUserInfo googleUser = googleAuthService.verifyGoogleIdToken(request.idToken());

        User user = userRepository.findByEmail(googleUser.email()).orElseGet(() -> {
            User newUser = new User(googleUser.email(), googleUser.firstName(), googleUser.lastName());
            newUser.setAvatarUrl(googleUser.picture());
            newUser.setEmailVerified(googleUser.emailVerified());
            roleRepository.findByName("CLIENTE").ifPresent(newUser::addRole);
            return userRepository.save(newUser);
        });

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("La cuenta de usuario se encuentra desactivada");
        }

        // Si ya existía, sincronizar avatar si no lo tenía y marcar email como verificado por Google
        if (user.getAvatarUrl() == null && googleUser.picture() != null) {
            user.setAvatarUrl(googleUser.picture());
        }
        if (!Boolean.TRUE.equals(user.getEmailVerified()) && googleUser.emailVerified()) {
            user.setEmailVerified(true);
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return issueTokens(user, deviceInfo);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request, String deviceInfo) {
        String token = request.refreshToken();

        if (jwtService.isTokenExpired(token)) {
            throw new IllegalArgumentException("El refresh token ha expirado. Por favor inicia sesión nuevamente.");
        }

        String userEmail = jwtService.extractUsername(token);
        String tokenHash = hashToken(token);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido o no reconocido"));

        if (!storedToken.isValid()) {
            throw new IllegalArgumentException("El refresh token ha sido revocado o ya no es válido");
        }

        User user = storedToken.getUser();
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("La cuenta de usuario se encuentra desactivada");
        }

        // Revocar el refresh token previo (rotación de tokens para máxima seguridad)
        storedToken.setIsRevoked(true);
        storedToken.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(storedToken);

        return issueTokens(user, deviceInfo);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setIsRevoked(true);
            token.setRevokedAt(OffsetDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse issueTokens(User user, String deviceInfo) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Guardar el hash del nuevo refresh token en la base de datos
        String tokenHash = hashToken(refreshToken);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(jwtService.getAccessTokenExpirationMs() / 1000 * 7 * 24); // alineado a expiración de refresh token
        
        RefreshToken refreshTokenEntity = new RefreshToken(user, tokenHash, expiresAt, deviceInfo);
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpirationMs(),
                UserResponse.fromEntity(user)
        );
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algoritmo SHA-256 no disponible", e);
        }
    }
}

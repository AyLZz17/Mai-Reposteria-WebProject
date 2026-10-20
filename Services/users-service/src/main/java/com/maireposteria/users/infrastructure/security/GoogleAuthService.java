package com.maireposteria.users.infrastructure.security;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GoogleAuthService {

    private final RestClient restClient;
    private final String expectedClientId;

    public GoogleAuthService(
            @Value("${oauth.google.client-id:}") String expectedClientId
    ) {
        this.restClient = RestClient.builder()
                .baseUrl("https://oauth2.googleapis.com")
                .build();
        this.expectedClientId = expectedClientId;
    }

    public record GoogleUserInfo(
            String sub,
            String email,
            String firstName,
            String lastName,
            String picture,
            boolean emailVerified
    ) {}

    public GoogleUserInfo verifyGoogleIdToken(String idToken) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        throw new IllegalArgumentException("Token de Google inválido o expirado");
                    })
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || !response.containsKey("email")) {
                throw new IllegalArgumentException("Respuesta inválida del proveedor Google");
            }

            String sub = (String) response.get("sub");
            String email = (String) response.get("email");
            String firstName = (String) response.getOrDefault("given_name", "");
            String lastName = (String) response.getOrDefault("family_name", "");
            String picture = (String) response.get("picture");
            String emailVerifiedStr = String.valueOf(response.get("email_verified"));
            boolean emailVerified = Boolean.parseBoolean(emailVerifiedStr);

            if (firstName == null || firstName.isBlank()) {
                String fullName = (String) response.getOrDefault("name", "Usuario");
                firstName = fullName;
                lastName = "";
            }

            return new GoogleUserInfo(sub, email, firstName, lastName, picture, emailVerified);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo verificar el token de Google: " + ex.getMessage());
        }
    }
}

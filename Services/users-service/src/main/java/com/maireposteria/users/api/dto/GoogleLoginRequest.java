package com.maireposteria.users.api.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "El ID token de Google es obligatorio")
        String idToken
) {
}

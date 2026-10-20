package com.maireposteria.users.api.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "El refresh token es obligatorio")
        String refreshToken
) {
}

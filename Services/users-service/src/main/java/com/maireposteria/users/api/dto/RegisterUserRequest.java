package com.maireposteria.users.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El formato del correo electrónico no es válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 50, message = "El apellido no puede exceder 50 caracteres")
        String lastName
) {
}

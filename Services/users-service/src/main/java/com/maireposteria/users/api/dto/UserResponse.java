package com.maireposteria.users.api.dto;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.maireposteria.users.domain.entity.Role;
import com.maireposteria.users.domain.entity.User;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Boolean active,
        Boolean emailVerified,
        OffsetDateTime createdAt,
        Set<String> roles
) {
    public static UserResponse fromEntity(User user) {
        Set<String> roleNames = user.getRoles() == null ? Set.of() :
                user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet());

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getActive(),
                user.getEmailVerified(),
                user.getCreatedAt(),
                roleNames
        );
    }
}

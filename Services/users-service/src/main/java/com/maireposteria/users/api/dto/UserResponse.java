package com.maireposteria.users.api.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.maireposteria.users.domain.entity.User;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Boolean active,
        Boolean emailVerified,
        OffsetDateTime createdAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getActive(),
                user.getEmailVerified(),
                user.getCreatedAt()
        );
    }
}

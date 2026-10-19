package com.maireposteria.users.domain.entity;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Entidad que representa la tabla <code>users</code> en PostgreSQL.
 *
 * <p>Mapea todos los campos de la tabla de usuarios del esquema de MAI Repostería.
 * No incluye relaciones con otras entidades todavía.</p>
 */
@Entity
@Table(name = "users")
public class User {

    // =========================================================
    // CLAVE PRIMARIA
    // =========================================================

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // =========================================================
    // DATOS DE AUTENTICACIÓN
    // =========================================================

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Hash de la contraseña. Puede ser null para usuarios que se registran
     * únicamente a través de OAuth (ej: Google).
     */
    @Size(max = 255)
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    // =========================================================
    // DATOS PERSONALES
    // =========================================================

    @NotBlank
    @Size(max = 100)
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    /** Número de teléfono. Opcional. */
    @Size(max = 20)
    @Column(name = "phone", length = 20)
    private String phone;

    /** URL del avatar del usuario. Opcional. */
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    // =========================================================
    // ESTADO DE LA CUENTA
    // =========================================================

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @NotNull
    @Column(name = "is_email_verified", nullable = false)
    private Boolean emailVerified = false;

    // =========================================================
    // FECHAS Y AUDITORÍA
    // =========================================================

    /** Último inicio de sesión. Null si nunca ha iniciado sesión. */
    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    /**
     * Fecha de creación. Hibernate la llena automáticamente al insertar
     * (equivalente al trigger updated_at de PostgreSQL, pero del lado Java).
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Fecha de última modificación. Hibernate la actualiza automáticamente
     * en cada UPDATE, igual que el trigger de PostgreSQL.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // =========================================================
    // CONSTRUCTORES
    // =========================================================

    /** Constructor vacío requerido por JPA. */
    protected User() {
    }

    /**
     * Constructor con los datos mínimos obligatorios para crear un usuario.
     *
     * @param email     Correo electrónico único del usuario.
     * @param firstName Nombre del usuario.
     * @param lastName  Apellido del usuario.
     */
    public User(String email, String firstName, String lastName) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.active = true;
        this.emailVerified = false;
    }

    // =========================================================
    // GETTERS Y SETTERS
    // =========================================================

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public OffsetDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(OffsetDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void addRole(Role role) {
        this.roles.add(role);
    }

    // =========================================================
    // toString  (nunca incluir passwordHash por seguridad)
    // =========================================================

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", active=" + active +
                ", emailVerified=" + emailVerified +
                ", createdAt=" + createdAt +
                '}';
    }
}

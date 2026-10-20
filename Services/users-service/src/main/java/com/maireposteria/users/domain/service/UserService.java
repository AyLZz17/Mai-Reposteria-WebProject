package com.maireposteria.users.domain.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.maireposteria.users.domain.entity.User;
import com.maireposteria.users.domain.repository.RoleRepository;
import com.maireposteria.users.domain.repository.UserRepository;
import com.maireposteria.users.api.exception.ConflictException;

/**
 * Lógica de negocio para la gestión de usuarios.
 *
 * <p>
 * Esta clase es el puente entre el controlador (que recibe peticiones HTTP)
 * y el repositorio (que habla con la base de datos).
 * </p>
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Spring inyecta dependencias automáticamente
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra un nuevo usuario en la base de datos con contraseña hasheada y rol CLIENTE.
     * Verifica primero que el email no esté ya registrado.
     *
     * @param email     Correo electrónico único.
     * @param password  Contraseña en texto plano a ser hasheada con BCrypt.
     * @param firstName Nombre del usuario.
     * @param lastName  Apellido del usuario.
     * @return El usuario guardado con su ID generado.
     * @throws IllegalArgumentException si el email ya está registrado.
     */
    @Transactional
    public User registerUser(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("El correo electrónico ya está registrado: " + email);
        }

        User newUser = new User(email, firstName, lastName);
        if (password != null && !password.isBlank()) {
            newUser.setPasswordHash(passwordEncoder.encode(password));
        }

        // Asignar rol por defecto CLIENTE si existe
        roleRepository.findByName("CLIENTE").ifPresent(newUser::addRole);

        return userRepository.save(newUser);
    }

    /**
     * Sobrecarga para registrar usuario sin contraseña (útil para flujos OAuth).
     */
    @Transactional
    public User registerUser(String email, String firstName, String lastName) {
        return registerUser(email, null, firstName, lastName);
    }

    /**
     * Busca un usuario por su ID.
     *
     * @param id Identificador único del usuario.
     * @return El usuario si existe, vacío si no.
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Busca un usuario por su correo electrónico.
     *
     * @param email Correo electrónico a buscar.
     * @return El usuario si existe, vacío si no.
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Verifica si un correo electrónico ya está registrado.
     *
     * @param email Correo electrónico a verificar.
     * @return true si ya existe un usuario con ese email.
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Activa o desactiva un usuario.
     *
     * @param id     Identificador único del usuario.
     * @param active Estado activo a establecer.
     * @return El usuario actualizado.
     */
    @Transactional
    public User setUserActiveStatus(UUID id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        user.setActive(active);
        return userRepository.save(user);
    }

    @Transactional
    public User promoteToAdmin(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ese correo"));
        roleRepository.findByName("ADMIN").ifPresent(user::addRole);
        return userRepository.save(user);
    }

    @Transactional
    public User removeAdminRole(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ese correo"));
        roleRepository.findByName("ADMIN").ifPresent(user::removeRole);
        return userRepository.save(user);
    }
}

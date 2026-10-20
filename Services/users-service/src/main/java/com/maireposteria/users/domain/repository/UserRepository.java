package com.maireposteria.users.domain.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.maireposteria.users.domain.entity.User;

/**
 * Repositorio JPA para la entidad {@link User}.
 *
 * <p>
 * Spring Data genera automáticamente la implementación de esta interfaz.
 * No es necesario escribir SQL ni implementar los métodos manualmente.
 * </p>
 */

public interface UserRepository extends JpaRepository<User, UUID> {
    /**
     * Busca un usuario por su correo electrónico.
     * Spring genera: SELECT * FROM users WHERE email = ?
     *
     * @param email Correo electrónico a buscar.
     * @return El usuario encontrado, o vacío si no existe.
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica si ya existe un usuario con ese correo electrónico.
     * Spring genera: SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)
     * Más eficiente que cargar el objeto completo solo para verificar.
     *
     * @param email Correo electrónico a verificar.
     * @return true si el email ya está registrado.
     */
    boolean existsByEmail(String email);
}

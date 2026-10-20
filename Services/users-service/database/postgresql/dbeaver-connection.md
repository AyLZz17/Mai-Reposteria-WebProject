# Configuración de DBeaver - Servicio de Usuarios

## Conexión a PostgreSQL

### Parámetros de conexión

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `mai_users_service` |
| **Username** | `postgres` |
| **Password** | `tu_password_aqui` |
| **Driver** | PostgreSQL |

### Pasos para conectar en DBeaver

1. **Abrir DBeaver** y hacer clic en "Nueva conexión" (icono de enchufe)

2. **Seleccionar PostgreSQL** como driver

3. **Configurar la conexión:**
   - Host: `localhost`
   - Puerto: `5432`
   - Base de datos: `mai_users_service`
   - Usuario: `postgres`
   - Contraseña: (tu contraseña)

4. **Probar conexión** haciendo clic en "Test Connection"

5. **Finalizar** y guardar la conexión

### Crear la base de datos

Si la base de datos no existe, ejecutar en el editor SQL de DBeaver:

```sql
CREATE DATABASE mai_users_service;
```

### Ejecutar el esquema

1. Conectarse a la base de datos `mai_users_service`
2. Abrir el archivo `01_schema.sql` en el editor SQL de DBeaver
3. Ejecutar todo el script (Ctrl+Enter o botón "Execute SQL")

### Verificar tablas creadas

```sql
-- Listar todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estructura de una tabla específica
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### Consultas útiles

```sql
-- Ver todos los usuarios con sus roles
SELECT * FROM user_roles_view;

-- Ver cuentas OAuth vinculadas
SELECT * FROM user_oauth_accounts_view;

-- Ver tokens de refresco activos
SELECT 
    rt.id,
    u.email,
    rt.device_info,
    rt.expires_at,
    rt.is_revoked
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id
WHERE rt.is_revoked = FALSE
AND rt.expires_at > NOW();

-- Ver intentos de login fallidos recientes
SELECT 
    email,
    ip_address,
    failure_reason,
    created_at
FROM login_attempts
WHERE success = FALSE
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Notas importantes

- **Producción:** Cambiar las credenciales por variables de entorno
- **Seguridad:** Nunca commitear archivos con contraseñas reales
- **Backups:** Configurar backups automáticos de PostgreSQL

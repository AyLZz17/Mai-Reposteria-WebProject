-- ============================================
-- MAI REPOSTERÍA - SERVICIO DE USUARIOS
-- Esquema de base de datos PostgreSQL
-- Sprint: Autenticación JWT + OAuth 2.0
-- ============================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE mai_users_service;

-- Conectarse a la base de datos
-- \c mai_users_service;

-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- NULL para usuarios solo OAuth
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: user_roles (relación muchos a muchos)
-- ============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- ============================================
-- TABLA: oauth_providers
-- ============================================
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'google', 'facebook', etc.
    display_name VARCHAR(100) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    authorization_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    user_info_url TEXT NOT NULL,
    scope VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: oauth_accounts
-- ============================================
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES oauth_providers(id) ON DELETE CASCADE,
    provider_user_id VARCHAR(255) NOT NULL, -- ID del usuario en el proveedor
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_id)
);

-- ============================================
-- TABLA: refresh_tokens
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE, -- Hash del token por seguridad
    device_info VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TABLA: password_reset_tokens
-- ============================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: email_verification_tokens
-- ============================================
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: login_attempts (seguridad)
-- ============================================
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider_user_id ON oauth_accounts(provider_user_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: Actualizar updated_at
-- ============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_providers_updated_at
    BEFORE UPDATE ON oauth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Usuarios con sus roles
CREATE VIEW user_roles_view AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    r.id AS role_id,
    r.name AS role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- Vista: Usuarios con sus cuentas OAuth
CREATE VIEW user_oauth_accounts_view AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    op.name AS provider_name,
    op.display_name AS provider_display_name,
    oa.provider_user_id,
    oa.created_at AS linked_at
FROM users u
JOIN oauth_accounts oa ON u.id = oa.user_id
JOIN oauth_providers op ON oa.provider_id = op.id;

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
    ('CLIENTE', 'Cliente regular de la repostería'),
    ('ADMIN', 'Administradora del sistema'),
    ('SUPER_ADMIN', 'Super administrador con acceso total');

-- Insertar proveedor OAuth de Google
INSERT INTO oauth_providers (name, display_name, client_id, client_secret, authorization_url, token_url, user_info_url, scope)
VALUES (
    'google',
    'Google',
    'YOUR_GOOGLE_CLIENT_ID',
    'YOUR_GOOGLE_CLIENT_SECRET',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    'https://www.googleapis.com/oauth2/v2/userinfo',
    'openid email profile'
);

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE roles IS 'Roles disponibles en el sistema (CLIENTE, ADMIN, SUPER_ADMIN)';
COMMENT ON TABLE user_roles IS 'Relación muchos a muchos entre usuarios y roles';
COMMENT ON TABLE oauth_providers IS 'Proveedores OAuth 2.0 configurados (Google, etc.)';
COMMENT ON TABLE oauth_accounts IS 'Cuentas OAuth vinculadas a usuarios del sistema';
COMMENT ON TABLE refresh_tokens IS 'Tokens de refresco para JWT';
COMMENT ON TABLE password_reset_tokens IS 'Tokens para restablecer contraseña';
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificar email';
COMMENT ON TABLE login_attempts IS 'Registro de intentos de login para seguridad';

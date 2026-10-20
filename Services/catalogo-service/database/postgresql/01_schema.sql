-- ============================================
-- MAI REPOSTERÍA - SERVICIO DE CATÁLOGO
-- Esquema de base de datos PostgreSQL
-- Base de datos: mai_catalog_service
-- ============================================

-- Crear base de datos (ejecutar manualmente en caso de ser necesario):
-- CREATE DATABASE mai_catalog_service;

-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: categories (Categorías de productos)
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: products (Productos del catálogo)
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    main_image_url TEXT,
    images TEXT[] DEFAULT '{}', -- Galería de imágenes secundarias
    is_customizable BOOLEAN DEFAULT FALSE, -- Si permite personalización (sabores, rellenos, mensajes)
    is_featured BOOLEAN NOT NULL DEFAULT FALSE, -- Mostrar en la sección destacada de la portada
    display_order INT NOT NULL DEFAULT 0, -- Orden en la sección destacada
    display_colors TEXT[] NOT NULL DEFAULT '{}', -- Colores mostrados como indicadores en la tarjeta
    image_position VARCHAR(50) NOT NULL DEFAULT '50% 50%', -- Posición CSS de la imagen de la tarjeta
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: storefront_settings (Configuración editable de la portada)
-- ============================================
CREATE TABLE storefront_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hero_title VARCHAR(150) NOT NULL DEFAULT 'New Product',
    hero_background_url TEXT NOT NULL DEFAULT '/images/banner/Diseño sin título.svg',
    hero_logo_url TEXT NOT NULL DEFAULT '/images/brand/logo.svg',
    hero_overlay_color VARCHAR(30) NOT NULL DEFAULT '#d9bcae',
    hero_title_color VARCHAR(30) NOT NULL DEFAULT '#f5eee7',
    card_button_label VARCHAR(80) NOT NULL DEFAULT 'ADD TO CART',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO storefront_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLA: product_customizations (Opciones de personalización opcionales)
-- ============================================
CREATE TABLE product_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ej: 'Tamaño (Porciones)', 'Sabor de Bizcocho', 'Relleno'
    options JSONB NOT NULL DEFAULT '[]', -- Ej: [{"label": "10 porciones", "extra_price": 0}, {"label": "20 porciones", "extra_price": 15000}]
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN DE BÚSQUEDA
-- ============================================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- FUNCIÓN Y TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

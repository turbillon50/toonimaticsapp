-- Extra Toonimatics schema: chat, products, and services.
-- Keep this separate from schema.sql so parallel work can apply it independently.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS toon;

CREATE TABLE IF NOT EXISTS toon.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('directo', 'grupo')),
  nombre TEXT,
  proyecto_id UUID REFERENCES toon.proyectos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chats_proyecto_id_idx
  ON toon.chats (proyecto_id);

CREATE INDEX IF NOT EXISTS chats_tipo_created_at_idx
  ON toon.chats (tipo, created_at DESC);

CREATE TABLE IF NOT EXISTS toon.chat_miembros (
  chat_id UUID NOT NULL REFERENCES toon.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_miembros_user_id_idx
  ON toon.chat_miembros (user_id);

CREATE TABLE IF NOT EXISTS toon.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES toon.chats(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'audio', 'video', 'avance')),
  media_url TEXT,
  leido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mensajes_chat_id_created_at_idx
  ON toon.mensajes (chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS mensajes_autor_id_idx
  ON toon.mensajes (autor_id);

CREATE TABLE IF NOT EXISTS toon.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID REFERENCES toon.proyectos(id) ON DELETE SET NULL,
  vendedor_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
  descripcion TEXT NOT NULL DEFAULT '',
  precio NUMERIC NOT NULL CHECK (precio >= 0),
  moneda TEXT NOT NULL DEFAULT 'MXN' CHECK (char_length(trim(moneda)) > 0),
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS productos_proyecto_id_idx
  ON toon.productos (proyecto_id);

CREATE INDEX IF NOT EXISTS productos_vendedor_id_idx
  ON toon.productos (vendedor_id);

CREATE INDEX IF NOT EXISTS productos_created_at_idx
  ON toon.productos (created_at DESC);

CREATE TABLE IF NOT EXISTS toon.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL CHECK (char_length(trim(titulo)) > 0),
  descripcion TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL CHECK (char_length(trim(categoria)) > 0),
  precio_desde NUMERIC CHECK (precio_desde IS NULL OR precio_desde >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS servicios_proveedor_id_idx
  ON toon.servicios (proveedor_id);

CREATE INDEX IF NOT EXISTS servicios_categoria_created_at_idx
  ON toon.servicios (categoria, created_at DESC);

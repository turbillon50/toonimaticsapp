-- Toonimatics database schema
-- Tables live in the toon schema to match the app database access pattern.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS toon;

DO $$
BEGIN
  CREATE TYPE toon.rol_jerarquia AS ENUM ('creador', 'trabajador', 'espectador');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.rama_artistica AS ENUM (
    'cine',
    'ilustracion',
    'animacion',
    'literatura',
    'escultura',
    'tech',
    'audiovisual',
    'actuacion',
    'musica'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.estado_proyecto AS ENUM ('en_proceso', 'terminado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.estado_proyecto_miembro AS ENUM ('solicitud', 'activo', 'expulsado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.estado_reporte AS ENUM ('pendiente', 'en_revision', 'resuelto', 'descartado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.estado_amistad AS ENUM ('solicitud', 'activo', 'bloqueado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE toon.tipo_contenido AS ENUM ('imagen', 'animacion', 'audio');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS toon.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  telefono TEXT,
  nombre TEXT,
  apodo TEXT,
  descripcion TEXT,
  foto_url TEXT,
  rol_jerarquia toon.rol_jerarquia NOT NULL DEFAULT 'espectador',
  edad INTEGER CHECK (edad IS NULL OR (edad >= 0 AND edad <= 130)),
  verificado_real BOOLEAN NOT NULL DEFAULT false,
  control_parental BOOLEAN NOT NULL DEFAULT false,
  fecha_nacimiento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key
  ON toon.users (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_telefono_key
  ON toon.users (telefono)
  WHERE telefono IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_apodo_lower_key
  ON toon.users (lower(apodo))
  WHERE apodo IS NOT NULL;

CREATE TABLE IF NOT EXISTS toon.user_ramas (
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  rama_id toon.rama_artistica NOT NULL,
  subtitulo TEXT NOT NULL CHECK (char_length(trim(subtitulo)) > 0),
  experiencia_texto TEXT,
  PRIMARY KEY (user_id, rama_id, subtitulo)
);

CREATE INDEX IF NOT EXISTS user_ramas_rama_id_idx
  ON toon.user_ramas (rama_id);

CREATE TABLE IF NOT EXISTS toon.proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creador_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
  descripcion TEXT,
  estado toon.estado_proyecto NOT NULL DEFAULT 'en_proceso',
  portada_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proyectos_creador_id_idx
  ON toon.proyectos (creador_id);

CREATE INDEX IF NOT EXISTS proyectos_estado_created_at_idx
  ON toon.proyectos (estado, created_at DESC);

CREATE TABLE IF NOT EXISTS toon.proyecto_miembros (
  proyecto_id UUID NOT NULL REFERENCES toon.proyectos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  subtitulo TEXT NOT NULL CHECK (char_length(trim(subtitulo)) > 0),
  estado toon.estado_proyecto_miembro NOT NULL DEFAULT 'solicitud',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proyecto_id, user_id)
);

CREATE INDEX IF NOT EXISTS proyecto_miembros_user_id_idx
  ON toon.proyecto_miembros (user_id);

CREATE INDEX IF NOT EXISTS proyecto_miembros_estado_idx
  ON toon.proyecto_miembros (estado);

CREATE TABLE IF NOT EXISTS toon.tareas_studio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES toon.proyectos(id) ON DELETE CASCADE,
  asignado_a UUID REFERENCES toon.users(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL CHECK (char_length(trim(titulo)) > 0),
  descripcion TEXT,
  completada BOOLEAN NOT NULL DEFAULT false,
  puntos INTEGER NOT NULL DEFAULT 0 CHECK (puntos >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tareas_studio_proyecto_id_idx
  ON toon.tareas_studio (proyecto_id);

CREATE INDEX IF NOT EXISTS tareas_studio_asignado_a_idx
  ON toon.tareas_studio (asignado_a);

CREATE TABLE IF NOT EXISTS toon.puntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL REFERENCES toon.proyectos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL CHECK (cantidad <> 0),
  motivo TEXT NOT NULL CHECK (char_length(trim(motivo)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS puntos_user_id_idx
  ON toon.puntos (user_id);

CREATE INDEX IF NOT EXISTS puntos_proyecto_id_idx
  ON toon.puntos (proyecto_id);

CREATE TABLE IF NOT EXISTS toon.valoraciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluador_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  evaluado_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL REFERENCES toon.proyectos(id) ON DELETE CASCADE,
  estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (evaluador_id <> evaluado_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS valoraciones_unicas_por_proyecto_idx
  ON toon.valoraciones (evaluador_id, evaluado_id, proyecto_id);

CREATE INDEX IF NOT EXISTS valoraciones_evaluado_id_idx
  ON toon.valoraciones (evaluado_id);

CREATE INDEX IF NOT EXISTS valoraciones_proyecto_id_idx
  ON toon.valoraciones (proyecto_id);

CREATE TABLE IF NOT EXISTS toon.reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reportante_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  reportado_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL CHECK (char_length(trim(motivo)) > 0),
  estado toon.estado_reporte NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reportante_id <> reportado_id)
);

CREATE INDEX IF NOT EXISTS reportes_reportado_id_estado_idx
  ON toon.reportes (reportado_id, estado);

CREATE TABLE IF NOT EXISTS toon.seguidores (
  seguidor_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  seguido_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  PRIMARY KEY (seguidor_id, seguido_id),
  CHECK (seguidor_id <> seguido_id)
);

CREATE INDEX IF NOT EXISTS seguidores_seguido_id_idx
  ON toon.seguidores (seguido_id);

CREATE TABLE IF NOT EXISTS toon.proyectos_fav (
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL REFERENCES toon.proyectos(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, proyecto_id)
);

CREATE INDEX IF NOT EXISTS proyectos_fav_proyecto_id_idx
  ON toon.proyectos_fav (proyecto_id);

CREATE TABLE IF NOT EXISTS toon.amigos (
  user_a UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  estado toon.estado_amistad NOT NULL DEFAULT 'solicitud',
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a <> user_b)
);

CREATE UNIQUE INDEX IF NOT EXISTS amigos_par_unico_idx
  ON toon.amigos (least(user_a::text, user_b::text), greatest(user_a::text, user_b::text));

CREATE INDEX IF NOT EXISTS amigos_user_b_idx
  ON toon.amigos (user_b);

CREATE INDEX IF NOT EXISTS amigos_estado_idx
  ON toon.amigos (estado);

CREATE TABLE IF NOT EXISTS toon.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (char_length(trim(tipo)) > 0),
  mensaje TEXT NOT NULL CHECK (char_length(trim(mensaje)) > 0),
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notificaciones_user_id_created_at_idx
  ON toon.notificaciones (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notificaciones_user_id_leida_idx
  ON toon.notificaciones (user_id, leida);

CREATE TABLE IF NOT EXISTS toon.contenido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
  tipo toon.tipo_contenido NOT NULL,
  url TEXT NOT NULL CHECK (char_length(trim(url)) > 0),
  titulo TEXT NOT NULL CHECK (char_length(trim(titulo)) > 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contenido_user_id_created_at_idx
  ON toon.contenido (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS contenido_tipo_idx
  ON toon.contenido (tipo);

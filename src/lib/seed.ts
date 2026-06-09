import sql from './db'

export async function seedDB() {
  // Artists seed
  await sql`
    INSERT INTO users (email, name, username, bio, role, artistic_role, location, avatar_url, verified, followers_count, following_count)
    VALUES
      ('sofia.reyes@demo.com', 'Sofía Reyes', 'sofia_reyes', 'Directora de cortometrajes premiada en Cannes. Especialista en narrativa visual latinoamericana.', 'artist', 'Directora', 'Guadalajara, México', '/demo/avatar1.jpg', true, 2847, 134),
      ('marco.luna@demo.com', 'Marco Luna', 'marco_luna', 'Músico y compositor. Score para más de 40 producciones. Nominado al Grammy Latino.', 'artist', 'Compositor', 'Ciudad de México', '/demo/avatar2.jpg', true, 5210, 89),
      ('ana.flores@demo.com', 'Ana Flores', 'ana_flores', 'Fotógrafa de sets y making-of. 15 años de experiencia en producciones internacionales.', 'artist', 'Fotógrafa', 'Monterrey, México', '/demo/avatar3.jpg', false, 1203, 456),
      ('luis.vargas@demo.com', 'Luis Vargas', 'luis_vargas', 'Actor de teatro y televisión. Egresado del INBA. Disponible para proyectos.', 'artist', 'Actor', 'Guadalajara, México', '/demo/avatar4.jpg', true, 8934, 201),
      ('studio.prod@demo.com', 'Producciones NovaStar', 'novastar_studio', 'Estudio de producción audiovisual. Buscamos talento para proyectos 2025-2026.', 'studio', 'Estudio', 'CDMX', '/demo/avatar5.jpg', true, 12450, 678)
    ON CONFLICT (email) DO NOTHING
  `

  // Content seed
  await sql`
    INSERT INTO content (title, description, type, thumbnail_url, genre, tags, views_count, likes_count, is_published, is_featured)
    VALUES
      ('Sombras del Pacífico', 'Cortometraje ganador del festival de Morelia 2024. Una historia de identidad y pertenencia.', 'short', '/demo/thumb1.jpg', 'Drama', ARRAY['drama','festival','latinoamerica'], 45230, 3421, true, true),
      ('Ecos del Norte', 'Serie documental sobre músicos tradicionales del norte de México. 6 episodios.', 'series', '/demo/thumb2.jpg', 'Documental', ARRAY['documental','musica','cultura'], 128400, 9876, true, true),
      ('Reel Dirección 2024', 'Compilación de mis mejores trabajos de dirección este año.', 'video', '/demo/thumb3.jpg', 'Reel', ARRAY['reel','direccion','2024'], 23100, 1892, true, false),
      ('La Ciudad que Duerme', 'Película independiente sobre la vida nocturna de Guadalajara. 90 min.', 'film', '/demo/thumb4.jpg', 'Drama urbano', ARRAY['pelicula','guadalajara','drama'], 67800, 5543, true, true),
      ('Portfolio Fotografía de Sets', 'Selección de fotografías en sets de producción 2023-2024.', 'photo', '/demo/thumb5.jpg', 'Making-of', ARRAY['fotografia','sets','produccion'], 12300, 987, true, false)
    ON CONFLICT DO NOTHING
  `
  console.log('Seed completado')
}

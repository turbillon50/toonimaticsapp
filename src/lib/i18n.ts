export const translations = {
  es: {
    nav: { home: 'Inicio', explore: 'Explorar', create: 'Crear', messages: 'Mensajes', profile: 'Perfil' },
    home: {
      tagline: 'Donde el talento se vuelve obra.',
      sub: 'Publica tu trabajo, colabora y monetiza tu arte.',
      cta: 'Crear perfil gratis',
      explore: 'Explorar artistas',
      featured: 'Destacados',
      artists: 'Artistas',
      latest: 'Lo más reciente',
      seeAll: 'Ver todos',
    },
    roles: { director: 'Director', actor: 'Actor', musician: 'Músico', photographer: 'Fotógrafo', editor: 'Editor', producer: 'Productor' },
    auth: { signin: 'Iniciar sesión', magic: 'Enviar link mágico', email: 'Correo electrónico', sent: 'Revisa tu correo', noPass: 'Sin contraseña, sin fricción.' },
    profile: { follow: 'Seguir', following: 'Siguiendo', works: 'obras', followers: 'seguidores', verified: 'Verificado' },
    content: { views: 'vistas', likes: 'likes', save: 'Guardar' },
  },
  en: {
    nav: { home: 'Home', explore: 'Explore', create: 'Create', messages: 'Messages', profile: 'Profile' },
    home: {
      tagline: 'Where talent becomes art.',
      sub: 'Publish your work, collaborate and monetize your art.',
      cta: 'Create free profile',
      explore: 'Explore artists',
      featured: 'Featured',
      artists: 'Artists',
      latest: 'Latest',
      seeAll: 'See all',
    },
    roles: { director: 'Director', actor: 'Actor', musician: 'Musician', photographer: 'Photographer', editor: 'Editor', producer: 'Producer' },
    auth: { signin: 'Sign in', magic: 'Send magic link', email: 'Email address', sent: 'Check your inbox', noPass: 'No password, no friction.' },
    profile: { follow: 'Follow', following: 'Following', works: 'works', followers: 'followers', verified: 'Verified' },
    content: { views: 'views', likes: 'likes', save: 'Save' },
  },
}

export type Lang = 'es' | 'en'
export type T = typeof translations.es

export function t(lang: Lang): T {
  return translations[lang]
}

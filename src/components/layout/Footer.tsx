'use client'
import { motion } from 'framer-motion'
import { FadeInOnScroll } from '../ui/motion'

const SOCIAL_LINKS = [
  { name: 'Instagram', icon: '📸', href: '#', color: '#E1306C' },
  { name: 'TikTok', icon: '🎵', href: '#', color: '#69C9D0' },
  { name: 'YouTube', icon: '▶️', href: '#', color: '#FF0000' },
  { name: 'Facebook', icon: '👥', href: '#', color: '#1877F2' },
  { name: 'X/Twitter', icon: '✕', href: '#', color: '#FFFFFF' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#1E1E1E] bg-[#080808] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-2xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                TOONIMATICS
              </span>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                La plataforma donde el talento artístico se encuentra, colabora y crece.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3 mt-5">
                {SOCIAL_LINKS.map(({ name, icon, href, color }) => (
                  <motion.a
                    key={name}
                    href={href}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    title={name}
                    className="w-9 h-9 rounded-full bg-[#1E1E1E] flex items-center justify-center text-base transition-all duration-200 hover:bg-[#2A2A2A]"
                    style={{ '--hover-color': color } as React.CSSProperties}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Plataforma', links: ['Explorar', 'Artistas', 'Estudios', 'Tienda', 'Proyectos'] },
              { title: 'Artistas', links: ['Actores', 'Directores', 'Músicos', 'Fotógrafos', 'Editores'] },
              { title: 'Compañía', links: ['Nosotros', 'Términos', 'Privacidad', 'Soporte', 'Blog'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-gray-200 text-sm transition-colors hover:pl-1 duration-200 block">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#1E1E1E] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              © 2025 Toonimatics. Todos los derechos reservados.
            </p>
            <p className="text-gray-700 text-xs">
              Hecho con 🎨 para artistas latinoamericanos
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </footer>
  )
}

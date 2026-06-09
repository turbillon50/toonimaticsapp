'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setSent(true); setLoading(false) }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'radial-gradient(ellipse at 30% 50%, rgba(255,107,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(139,0,255,0.08) 0%, transparent 60%), #0A0A0A'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="toon-card p-8">
          <div className="text-center mb-8">
            <span className="text-3xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>TOONIMATICS</span>
            <p className="text-gray-400 text-sm mt-2">La plataforma para artistas creativos</p>
          </div>

          {!sent ? (
            <>
              <h1 className="text-xl font-bold text-white mb-2">Iniciar sesión</h1>
              <p className="text-gray-500 text-sm mb-6">Te enviamos un link mágico a tu correo. Sin contraseña.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="artista@ejemplo.com"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl toon-gradient-bg text-white font-bold text-sm disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
                      Enviando...
                    </span>
                  ) : 'Enviar link mágico ✨'}
                </motion.button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#1E1E1E] text-center">
                <p className="text-gray-600 text-xs">¿Primera vez? Se crea tu cuenta automáticamente.</p>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-white font-bold text-lg mb-2">Revisa tu correo</h2>
              <p className="text-gray-400 text-sm">Te enviamos un link a <strong className="text-[#FF6B00]">{email}</strong></p>
              <p className="text-gray-600 text-xs mt-3">El link expira en 10 minutos.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

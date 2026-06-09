'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import Link from 'next/link'

export default function SignIn() {
  const { lang } = useApp()
  const tx = t(lang).auth
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => { setSent(true); setLoading(false) }, 1400)
  }

  return (
    <div className="app-shell">
      <main className="page-content flex flex-col">
        {/* Hero image */}
        <div className="relative h-52 flex-shrink-0">
          <Image src="/hf/hero1.webp" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[var(--c-bg)]" />
          <Link href="/" className="absolute top-12 left-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white text-sm">
            ←
          </Link>
        </div>

        <div className="flex-1 px-6 pb-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              TOONIMATICS
            </span>
          </div>

          {!sent ? (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--c-text)', fontFamily: "'Syne', sans-serif" }}>
                {tx.signin}
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>{tx.noPass}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--c-muted)' }}>
                    {tx.email}
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="artista@ejemplo.com" required
                    className="w-full rounded-xl px-4 py-3.5 text-sm border focus:outline-none focus:border-[#FF6B00] transition-colors"
                    style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl toon-gradient-bg text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? (
                    <><motion.span animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}>⟳</motion.span> {lang==='es'?'Enviando...':'Sending...'}</>
                  ) : <>{tx.magic} ✨</>}
                </motion.button>
              </form>

              <p className="text-center text-xs mt-5" style={{ color: 'var(--c-muted)' }}>
                {lang==='es'?'¿Primera vez? Tu cuenta se crea automáticamente.':'First time? Your account is created automatically.'}
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="text-center py-8">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--c-text)', fontFamily: "'Syne', sans-serif" }}>{tx.sent}</h2>
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
                {lang==='es'?`Link enviado a `:`Link sent to `}
                <strong style={{ color: 'var(--toon-orange)' }}>{email}</strong>
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--c-muted)' }}>
                {lang==='es'?'Expira en 10 minutos.':'Expires in 10 minutes.'}
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

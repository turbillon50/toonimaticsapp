'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from './i18n'

type Theme = 'dark' | 'light'
type DemoMode = 'public' | 'user' | 'admin'

interface AppCtx {
  theme: Theme
  toggleTheme: () => void
  lang: Lang
  setLang: (l: Lang) => void
  demoMode: DemoMode
  setDemoMode: (m: DemoMode) => void
}

const Ctx = createContext<AppCtx>({} as AppCtx)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [lang, setLang] = useState<Lang>('es')
  const [demoMode, setDemoMode] = useState<DemoMode>('public')

  useEffect(() => {
    const saved = localStorage.getItem('toon-theme') as Theme | null
    if (saved) setTheme(saved)
    const savedLang = localStorage.getItem('toon-lang') as Lang | null
    if (savedLang) setLang(savedLang)
    // Detect browser language
    else if (navigator.language.startsWith('en')) setLang('en')
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('toon-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('toon-lang', lang)
  }, [lang])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <Ctx.Provider value={{ theme, toggleTheme, lang, setLang, demoMode, setDemoMode }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)

import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        toon: {
          orange: '#FF6B00',
          magenta: '#FF1493',
          purple: '#8B00FF',
          dark: '#0A0A0A',
          card: '#111111',
          border: '#1E1E1E',
          text: '#F0F0F0',
          muted: '#888888',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
      },
      backgroundImage: {
        'toon-gradient': 'linear-gradient(135deg, #FF6B00, #FF1493, #8B00FF)',
        'toon-glow': 'radial-gradient(ellipse at center, rgba(255,107,0,0.15) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 60%, #0A0A0A 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,0,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(139,0,255,0.6)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
export default config

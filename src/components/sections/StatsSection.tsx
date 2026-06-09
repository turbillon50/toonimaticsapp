'use client'
import { FadeInOnScroll, StaggerContainer, StaggerItem, NumberCounter } from '../ui/motion'

const STATS = [
  { value: 12000, label: 'Artistas registrados', suffix: '+', icon: '🎨' },
  { value: 48000, label: 'Obras publicadas', suffix: '+', icon: '🎬' },
  { value: 3200, label: 'Colaboraciones exitosas', suffix: '+', icon: '🤝' },
  { value: 98, label: 'Satisfacción de usuarios', suffix: '%', icon: '⭐' },
]

export default function StatsSection() {
  return (
    <section className="py-20 border-y border-[#1E1E1E]" style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.03), rgba(139,0,255,0.03))' }}>
      <div className="max-w-7xl mx-auto px-4">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <StaggerItem key={stat.label}>
              <div className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black toon-gradient-text mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <NumberCounter to={stat.value} />{stat.suffix}
                </div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

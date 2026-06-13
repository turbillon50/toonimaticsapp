export type NivelPuntos = 'Aprendiz' | 'Artista' | 'Profesional' | 'Maestro'

export interface ProgresoNivel {
  nivelActual: NivelPuntos
  siguienteNivel: NivelPuntos | null
  puntosParaSiguiente: number
  porcentaje: number
}

interface NivelConfig {
  nivel: NivelPuntos
  minimo: number
  siguiente: NivelPuntos | null
  siguienteMinimo: number | null
}

const NIVELES: NivelConfig[] = [
  {
    nivel: 'Aprendiz',
    minimo: 0,
    siguiente: 'Artista',
    siguienteMinimo: 100,
  },
  {
    nivel: 'Artista',
    minimo: 100,
    siguiente: 'Profesional',
    siguienteMinimo: 300,
  },
  {
    nivel: 'Profesional',
    minimo: 300,
    siguiente: 'Maestro',
    siguienteMinimo: 700,
  },
  {
    nivel: 'Maestro',
    minimo: 700,
    siguiente: null,
    siguienteMinimo: null,
  },
]

function normalizarPuntos(total: number) {
  if (!Number.isFinite(total)) {
    return 0
  }

  return Math.max(0, Math.trunc(total))
}

function getNivelConfig(total: number) {
  const puntos = normalizarPuntos(total)

  for (let index = NIVELES.length - 1; index >= 0; index -= 1) {
    const nivel = NIVELES[index]

    if (puntos >= nivel.minimo) {
      return nivel
    }
  }

  return NIVELES[0]
}

export function getNivelByPuntos(total: number): NivelPuntos {
  return getNivelConfig(total).nivel
}

export function getProgresoNivel(total: number): ProgresoNivel {
  const puntos = normalizarPuntos(total)
  const nivel = getNivelConfig(puntos)

  if (nivel.siguiente === null || nivel.siguienteMinimo === null) {
    return {
      nivelActual: nivel.nivel,
      siguienteNivel: null,
      puntosParaSiguiente: 0,
      porcentaje: 100,
    }
  }

  const puntosEnNivel = puntos - nivel.minimo
  const puntosDelTramo = nivel.siguienteMinimo - nivel.minimo
  const porcentaje = Math.min(100, Math.max(0, Math.round((puntosEnNivel / puntosDelTramo) * 100)))

  return {
    nivelActual: nivel.nivel,
    siguienteNivel: nivel.siguiente,
    puntosParaSiguiente: nivel.siguienteMinimo - puntos,
    porcentaje,
  }
}

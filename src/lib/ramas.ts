/**
 * Ramas artisticas de Toonimatics — fuente: documento de conceptos de la clienta.
 * Las 9 areas principales, cada una con su color identificador y subtitulos.
 * Esta es la base compartida que usan: jerarquia de titulos, badges de perfil,
 * filtros de busqueda y seleccion al registrarse.
 */

export type RamaId =
  | "cine"
  | "ilustracion"
  | "animacion"
  | "literatura"
  | "escultura"
  | "tech"
  | "audiovisual"
  | "actuacion"
  | "musica";

export interface Rama {
  id: RamaId;
  nombre: string;
  color: string;        // color principal (hex)
  colorNombre: string;  // nombre del color segun el documento
  subtitulos: string[]; // titulos/roles dentro de la rama
}

export const RAMAS_ARTISTICAS: Rama[] = [
  {
    id: "cine",
    nombre: "Cinematografía",
    color: "#E23B3B",
    colorNombre: "Rojo",
    subtitulos: ["Director de cine", "Guionista", "Editor de video", "Camarógrafo", "Productor"],
  },
  {
    id: "ilustracion",
    nombre: "Ilustración artística",
    color: "#F5871F",
    colorNombre: "Naranja",
    subtitulos: ["Ilustrador", "Concept artist", "Diseñador de personajes", "Storyboard artist", "Colorista"],
  },
  {
    id: "animacion",
    nombre: "Animación",
    color: "#F2C53D",
    colorNombre: "Amarillo",
    subtitulos: ["Director de animación", "Animador 2D", "Animador 3D", "Rigger", "Intercalador"],
  },
  {
    id: "literatura",
    nombre: "Literatura",
    color: "#9ACD32",
    colorNombre: "Verde limón",
    subtitulos: ["Escritor", "Guionista literario", "Editor de texto", "Corrector", "Narrador"],
  },
  {
    id: "escultura",
    nombre: "Escultura",
    color: "#3CA55C",
    colorNombre: "Verde",
    subtitulos: ["Escultor", "Modelador 3D", "Artista de props", "Diseñador de maquetas"],
  },
  {
    id: "tech",
    nombre: "Programadores y técnicos",
    color: "#3B82E2",
    colorNombre: "Azul",
    subtitulos: ["Programador", "Técnico de software", "Ingeniero de sonido", "Soporte técnico", "Pipeline TD"],
  },
  {
    id: "audiovisual",
    nombre: "Producción audiovisual",
    color: "#8B5CF6",
    colorNombre: "Morado",
    subtitulos: ["Productor audiovisual", "Editor", "VFX artist", "Compositor de escena", "Colorista digital"],
  },
  {
    id: "actuacion",
    nombre: "Actuación",
    color: "#EC4899",
    colorNombre: "Rosa",
    subtitulos: ["Actor de doblaje", "Actor de voz", "Director de doblaje", "Locutor"],
  },
  {
    id: "musica",
    nombre: "Música",
    color: "#9C6B4A",
    colorNombre: "Café",
    subtitulos: ["Compositor", "Músico", "Productor musical", "Diseñador de sonido", "Cantante"],
  },
];

/** Los 3 titulos jerarquicos del documento. */
export type RolJerarquia = "creador" | "trabajador" | "espectador";

export const ROLES_JERARQUIA: Record<RolJerarquia, { nombre: string; descripcion: string }> = {
  creador: {
    nombre: "Creador",
    descripcion: "Crea proyectos, gestiona elenco, invita y expulsa colaboradores. Mantiene su titulo con un sistema de puntos.",
  },
  trabajador: {
    nombre: "Trabajador",
    descripcion: "Se une a proyectos segun su experiencia artistica. Recibe tareas en STUDIO. Sistema de puntaje mensual.",
  },
  espectador: {
    nombre: "Espectador",
    descripcion: "Ve el contenido producido, sigue proyectos, dona y participa en eventos.",
  },
};

export function getRama(id: RamaId): Rama | undefined {
  return RAMAS_ARTISTICAS.find((r) => r.id === id);
}

/** Variante de color (aclarar/oscurecer) para evitar repeticion visual entre subtitulos. */
export function variarColor(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.max(0, Math.min(255, Math.round(r + (factor * 255))));
  g = Math.max(0, Math.min(255, Math.round(g + (factor * 255))));
  b = Math.max(0, Math.min(255, Math.round(b + (factor * 255))));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

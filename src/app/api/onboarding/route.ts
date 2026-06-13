import { NextResponse, type NextRequest } from 'next/server'

import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { RAMAS_ARTISTICAS, type RamaId, type RolJerarquia } from '@/lib/ramas'

export const dynamic = 'force-dynamic'

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/
const ROLE_IDS = ['creador', 'trabajador', 'espectador'] as const satisfies readonly RolJerarquia[]

interface OnboardingPayload {
  name: string
  username: string
  bio: string
  role: RolJerarquia
  artistic_role: string
  rama: RamaId
  subtitulo: string
}

interface OnboardingUser {
  id: string
  email: string
  name: string | null
  username: string
  bio: string | null
  role: RolJerarquia
  artistic_role: string | null
  created_at: Date
}

interface ExistingUserRow {
  id: string
}

type ParseResult =
  | { ok: true; payload: OnboardingPayload }
  | { ok: false; status: number; error: string }

export async function POST(request: NextRequest) {
  const session = await auth()
  const email = session?.user?.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'Inicia sesion para completar tu perfil.' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'El cuerpo de la solicitud no es JSON valido.' }, { status: 400 })
  }

  const parsed = parseOnboardingPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const { payload } = parsed

  try {
    const existingUsername = await sql<ExistingUserRow[]>`
      SELECT id
      FROM toon.users
      WHERE lower(username) = lower(${payload.username})
      LIMIT 1
    `

    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Ese nombre de usuario ya esta en uso.' }, { status: 409 })
    }

    const user = await sql.begin(async (tx) => {
      const insertedUsers = await tx<OnboardingUser[]>`
        INSERT INTO toon.users (
          email,
          name,
          username,
          bio,
          role,
          artistic_role,
          verified,
          verification_status,
          followers_count,
          following_count
        )
        VALUES (
          ${email},
          ${payload.name},
          ${payload.username},
          ${payload.bio},
          ${payload.role},
          ${payload.artistic_role},
          false,
          'pending',
          0,
          0
        )
        RETURNING
          id,
          email,
          name,
          username,
          bio,
          role,
          artistic_role,
          created_at
      `
      const insertedUser = insertedUsers[0]

      if (!insertedUser) {
        throw new Error('No se pudo crear el usuario.')
      }

      await tx`
        INSERT INTO toon.user_ramas (
          user_id,
          rama_id,
          subtitulo,
          experiencia_texto
        )
        VALUES (
          ${insertedUser.id},
          ${payload.rama}::toon.rama_artistica,
          ${payload.subtitulo},
          ${payload.bio}
        )
      `

      return insertedUser
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (getPostgresCode(error) === '23505') {
      return NextResponse.json({ error: 'El usuario o correo ya existe.' }, { status: 409 })
    }

    console.error('Error creating onboarding user', error)

    return NextResponse.json({ error: 'No se pudo completar el onboarding.' }, { status: 500 })
  }
}

function parseOnboardingPayload(body: unknown): ParseResult {
  if (!isRecord(body)) {
    return { ok: false, status: 400, error: 'Datos de onboarding invalidos.' }
  }

  const name = readText(body.name)
  const username = normalizeUsername(readText(body.username) ?? '')
  const bio = readText(body.bio)
  const rawRole = readText(body.role)
  const artisticRole = readText(body.artistic_role)
  const rawRama = readText(body.rama)
  const subtitulo = readText(body.subtitulo)

  if (!name || name.length < 2 || name.length > 80) {
    return { ok: false, status: 400, error: 'Tu nombre debe tener entre 2 y 80 caracteres.' }
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      status: 400,
      error: 'El username debe tener 3 a 24 caracteres: letras, numeros o guion bajo.',
    }
  }

  if (!bio || bio.length > 280) {
    return { ok: false, status: 400, error: 'La bio es obligatoria y debe tener hasta 280 caracteres.' }
  }

  if (!rawRole || !isRolJerarquia(rawRole)) {
    return { ok: false, status: 400, error: 'Selecciona un rol valido.' }
  }

  if (!rawRama || !subtitulo || !artisticRole) {
    return { ok: false, status: 400, error: 'Selecciona una rama y un titulo artistico.' }
  }

  const rama = RAMAS_ARTISTICAS.find((item) => item.id === rawRama)

  if (!rama || !rama.subtitulos.includes(subtitulo)) {
    return { ok: false, status: 400, error: 'La rama artistica seleccionada no es valida.' }
  }

  if (artisticRole !== subtitulo) {
    return { ok: false, status: 400, error: 'El rol artistico debe coincidir con el titulo seleccionado.' }
  }

  return {
    ok: true,
    payload: {
      name,
      username,
      bio,
      role: rawRole,
      artistic_role: artisticRole,
      rama: rama.id,
      subtitulo,
    },
  }
}

function readText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function normalizeUsername(value: string): string {
  return value.replace(/^@+/, '').toLowerCase()
}

function isRolJerarquia(value: string): value is RolJerarquia {
  return ROLE_IDS.some((role) => role === value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getPostgresCode(error: unknown): string | null {
  if (!isRecord(error)) {
    return null
  }

  return typeof error.code === 'string' ? error.code : null
}

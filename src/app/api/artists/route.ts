import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const artists = await sql`
      SELECT id, name, username, bio, role, artistic_role, location,
             avatar_url, verified, followers_count, following_count
      FROM toon.users 
      WHERE role IN ('artist','studio')
      ORDER BY followers_count DESC
      LIMIT 20
    `
    return NextResponse.json({ artists })
  } catch {
    return NextResponse.json({ artists: [] })
  }
}

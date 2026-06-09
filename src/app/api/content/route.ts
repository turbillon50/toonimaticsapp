import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const content = await sql`
      SELECT id, title, description, type, thumbnail_url, genre, 
             views_count, likes_count, is_featured, created_at
      FROM toon.content 
      WHERE is_published = true 
      ORDER BY views_count DESC 
      LIMIT 20
    `
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ content: [] })
  }
}

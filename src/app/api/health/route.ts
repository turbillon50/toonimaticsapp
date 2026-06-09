import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM toon.users`
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      users: result[0].count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ status: 'error', db: 'disconnected', error: String(err) }, { status: 500 })
  }
}

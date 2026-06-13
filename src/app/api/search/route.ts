import { NextResponse, type NextRequest } from 'next/server'

import { getExploreSearchResults } from '@/app/explore/data'
import type { ExploreSearchResult } from '@/app/explore/types'

export const dynamic = 'force-dynamic'

const EMPTY_RESULTS: ExploreSearchResult = {
  proyectos: [],
  usuarios: [],
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''

  try {
    const results = await getExploreSearchResults(query)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching explore results', error)

    return NextResponse.json(EMPTY_RESULTS, { status: 500 })
  }
}

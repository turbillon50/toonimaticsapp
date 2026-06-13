import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import ExploreClient from './ExploreClient'
import { getInitialExploreData } from './data'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const initialData = await getInitialExploreData()

  return (
    <div className="app-shell">
      <TopBar title="Explorar" />
      <main className="page-content">
        <ExploreClient initialData={initialData} />
      </main>
      <BottomNav />
    </div>
  )
}

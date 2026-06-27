import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import styles from './layout.module.css'

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className={styles.shell}>
      {/* Sidebar desktop */}
      <aside className={styles.desktopSidebar}>
        <Sidebar />
      </aside>

      {/* TopBar mobile */}
      <div className={styles.mobilebar}>
        <TopBar />
      </div>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}

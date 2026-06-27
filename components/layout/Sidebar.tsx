'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const NAV = [
  { href: '/dashboard', label: 'Devis', icon: '📋' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/profile', label: 'Ma page', icon: '🏠' },
  { href: '/settings', label: 'Paramètres', icon: '⚙️' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={styles.sidebar} aria-label="Navigation principale">
      <div className={styles.logo}>
        <span className={styles.logoText}>Devis Pro</span>
        <span className={styles.logoBtp}>BTP</span>
      </div>

      <ul className={styles.nav} role="list">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <li key={href}>
              <Link
                href={href}
                className={[styles.navItem, active ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.icon} aria-hidden="true">{icon}</span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <form action="/api/auth/logout" method="POST" className={styles.logoutForm}>
        <button type="submit" className={styles.logout}>
          Se déconnecter
        </button>
      </form>
    </nav>
  )
}

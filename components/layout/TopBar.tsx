'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import styles from './TopBar.module.css'

export function TopBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className={styles.topbar}>
        <button
          className={styles.hamburger}
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          <span />
          <span />
          <span />
        </button>
        <div className={styles.logo}>
          <span>Devis Pro</span>
          <span className={styles.btp}>BTP</span>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-drawer"
        className={[styles.drawer, open ? styles.open : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>
    </>
  )
}

"use client"

import { useAuth } from "@/components/AuthProvider"
import ThemeToggle from "@/components/ThemeToggle"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NavBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('nav')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-voxreal-200/50 dark:border-voxreal-800/50">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-voxreal-600 to-purple-mid bg-clip-text text-transparent">
            VoxReal
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Link
                href="/feed"
                className="text-sm text-text-muted dark:text-text-muted-dark hover:text-voxreal-600 dark:hover:text-voxreal-400 transition-colors"
              >
                {t('feed')}
              </Link>
              <Link
                href="/create"
                className="text-sm text-text-muted dark:text-text-muted-dark hover:text-voxreal-600 dark:hover:text-voxreal-400 transition-colors"
              >
                {t('create')}
              </Link>
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-voxreal-200 dark:bg-voxreal-800 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-voxreal-500/30 transition-all duration-200"
              >
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card dark:bg-card-dark border border-voxreal-200/50 dark:border-voxreal-800/50 shadow-xl shadow-voxreal-500/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-voxreal-100 dark:border-voxreal-800">
                    <p className="font-semibold text-sm truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-muted-dark truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-text-muted dark:text-text-muted-dark hover:bg-voxreal-50 dark:hover:bg-voxreal-900/30 transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-voxreal-100 dark:border-voxreal-800"
                  >
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white hover:shadow-lg hover:shadow-voxreal-500/30 transition-all duration-200"
            >
              {t('signIn')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

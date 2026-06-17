"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useAuth } from "@/components/AuthProvider"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const t = useTranslations('auth')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, name)
      router.push("/feed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center mx-auto mb-4 shadow-lg shadow-voxreal-500/25">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{t('createAccount')}</h1>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            {t('joinVoxReal')}
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted dark:text-text-muted-dark">
              {t('displayName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('yourDisplayName')}
              required
              className="w-full rounded-xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-4 py-3 text-base font-medium placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:border-voxreal-500 dark:focus:border-voxreal-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted dark:text-text-muted-dark">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-4 py-3 text-base font-medium placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:border-voxreal-500 dark:focus:border-voxreal-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted dark:text-text-muted-dark">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('atLeast6Chars')}
              required
              minLength={6}
              className="w-full rounded-xl border-2 border-voxreal-200 dark:border-voxreal-800 bg-card dark:bg-card-dark px-4 py-3 text-base font-medium placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:border-voxreal-500 dark:focus:border-voxreal-400 transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-bold text-base shadow-lg shadow-voxreal-500/30 hover:shadow-xl hover:shadow-voxreal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('creatingAccount')}
              </span>
            ) : (
              t('createAccount')
            )}
          </button>

          <p className="text-center text-xs text-text-muted dark:text-text-muted-dark mt-2">
            {t('alreadyHaveAccount')}{" "}
            <Link href="/login" className="text-voxreal-600 dark:text-voxreal-400 font-semibold hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

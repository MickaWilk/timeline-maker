'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      router.push('/')
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      setSignupSuccess(true)
    }

    setLoading(false)
  }

  function toggleMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setSignupSuccess(false)
    setPassword('')
    setConfirmPassword('')
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-zinc-100 font-medium">Compte créé</p>
            <p className="text-zinc-400 text-sm mt-2">
              Vérifie ton email pour confirmer ton compte.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Timeline Maker</h1>
          <p className="text-zinc-400 text-sm mt-1">Ta vie, organisée.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Mot de passe</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === 'signin' ? 'Connexion...' : 'Création...'
              : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'
            }
          </Button>

          {mode === 'signin' && (
            <p className="text-center text-xs text-zinc-500">
              <a href="/auth/reset-password" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                Mot de passe oublié ?
              </a>
            </p>
          )}

          <p className="text-center text-xs text-zinc-500">
            {mode === 'signin' ? (
              <>
                Pas de compte ?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}

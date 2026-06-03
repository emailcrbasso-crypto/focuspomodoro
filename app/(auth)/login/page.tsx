'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GoogleButton from '@/components/GoogleButton'
import { Suspense } from 'react'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error') === 'oauth'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/timer')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1f2330]">Focus Pomodoro</h1>
          <p className="text-sm text-gray-500 mt-1">Entre na sua conta</p>
        </div>

        {oauthError && (
          <p className="text-sm text-red-600 text-center">
            Erro ao autenticar com Google. Tente novamente.
          </p>
        )}

        {/* Google OAuth */}
        <GoogleButton label="Entrar com Google" />

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">ou entre com e-mail</span>
          </div>
        </div>

        {/* Formulário e-mail/senha */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1f2330] mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1f2330] mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f2330] text-white rounded-xl py-3 font-semibold hover:bg-[#2d3347] transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-sm space-y-2">
          <Link href="/reset-password" className="block text-gray-500 hover:text-[#e74c3c] transition">
            Esqueceu a senha?
          </Link>
          <p className="text-gray-500">
            Novo por aqui?{' '}
            <Link href="/signup" className="font-medium text-[#e74c3c] hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

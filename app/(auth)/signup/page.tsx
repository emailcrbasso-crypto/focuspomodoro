'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password: fd.get('password') as string,
      options: {
        data: { full_name: fd.get('full_name') as string },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Sessão aberta imediatamente (confirmação de e-mail desativada no Supabase)
    if (data.session) {
      router.push('/timer')
      router.refresh()
      return
    }

    // Confirmação de e-mail necessária
    setConfirmEmail(email)
    setLoading(false)
  }

  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
          <div className="text-4xl">📬</div>
          <div>
            <h1 className="text-xl font-bold text-[#1f2330]">Confirme seu e-mail</h1>
            <p className="text-sm text-gray-500 mt-2">
              Enviamos um link de confirmação para{' '}
              <span className="font-medium text-[#1f2330]">{confirmEmail}</span>.
              Clique no link para ativar sua conta.
            </p>
          </div>
          <Link href="/login" className="block text-sm font-medium text-[#e74c3c] hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1f2330]">Focus Pomodoro</h1>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1f2330] mb-1" htmlFor="full_name">
              Nome
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
          </div>

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
              minLength={6}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f2330] text-white rounded-xl py-3 font-semibold hover:bg-[#2d3347] transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-[#e74c3c] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

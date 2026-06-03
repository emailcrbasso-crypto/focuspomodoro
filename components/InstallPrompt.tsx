'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Não mostrar se já está rodando como PWA instalada
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
  }

  if (!prompt || dismissed) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1f2330] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-xs w-[calc(100%-2rem)]">
      <span className="text-xl">📲</span>
      <span className="flex-1">Instalar o Focus Pomodoro</span>
      <button
        onClick={handleInstall}
        className="bg-[#e74c3c] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#c0392b] transition cursor-pointer shrink-0"
      >
        Instalar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-white transition cursor-pointer text-lg leading-none shrink-0"
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}

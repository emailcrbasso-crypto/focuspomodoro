'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_SETTINGS, type TimerSettings } from '@/hooks/useTimerSettings'

const STORAGE_KEY = 'fp_timer_settings'

export default function SettingsPage() {
  const [form, setForm]     = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setForm({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) })
    } catch {}
  }, [])

  function handleChange(key: keyof TimerSettings, value: number | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setForm(DEFAULT_SETTINGS)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setSaved(false)
  }

  const durationField = (
    label: string,
    key: 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes',
    min: number,
    max: number
  ) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1f2330]">{label}</p>
        <p className="text-xs text-gray-400">{min}–{max} minutos</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleChange(key, Math.max(min, form[key] - 1))}
          className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition cursor-pointer text-lg leading-none"
        >−</button>
        <span className="w-10 text-center font-bold text-[#1f2330]">{form[key]}</span>
        <button
          onClick={() => handleChange(key, Math.min(max, form[key] + 1))}
          className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition cursor-pointer text-lg leading-none"
        >+</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#1f2330]">Configurações</h1>

      {/* Durações */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2330] mb-2">Durações do timer</h2>
        <p className="text-xs text-gray-400 mb-4">As mudanças valem a partir da próxima sessão.</p>
        {durationField('Foco',          'focusMinutes',      5,  90)}
        {durationField('Pausa curta',   'shortBreakMinutes', 1,  30)}
        {durationField('Pausa longa',   'longBreakMinutes',  5,  60)}
      </div>

      {/* Sons */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2330] mb-4">Sons</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f2330]">Beep ao concluir sessão</p>
            <p className="text-xs text-gray-400">Três tons ascendentes ao fim de cada foco</p>
          </div>
          <button
            role="switch"
            aria-checked={form.soundEnabled}
            onClick={() => handleChange('soundEnabled', !form.soundEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              form.soundEnabled ? 'bg-[#e74c3c]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#1f2330] text-white rounded-xl py-3 font-semibold hover:bg-[#2d3347] transition cursor-pointer"
        >
          {saved ? '✓ Salvo!' : 'Salvar'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition cursor-pointer"
        >
          Restaurar padrões
        </button>
      </div>
    </div>
  )
}

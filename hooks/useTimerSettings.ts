'use client'

import { useEffect, useState } from 'react'

export interface TimerSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
}

const STORAGE_KEY = 'fp_timer_settings'

export function useTimerSettings() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) })
    } catch {}
    setLoaded(true)
  }, [])

  function saveSettings(updated: TimerSettings) {
    setSettings(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
  }

  return { settings, saveSettings, loaded }
}

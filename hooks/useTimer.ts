'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerMode = 'focus' | 'short_break' | 'long_break'
export type TimerState = 'idle' | 'running' | 'paused' | 'completed'

export const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Foco',
  short_break: 'Pausa curta',
  long_break: 'Pausa longa',
}

interface UseTimerOptions {
  onFocusComplete?: () => void
}

export function useTimer({ onFocusComplete }: UseTimerOptions = {}) {
  const [mode, setMode]           = useState<TimerMode>('focus')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus)
  const [focusCount, setFocusCount] = useState(0)

  // ── wall-clock refs ────────────────────────────────────────────────────────
  // Guardam o instante em que o timer começou/retomou e os segundos que havia
  // naquele momento. O cálculo de tempo sempre usa Date.now(), então o browser
  // throttling do setInterval não afeta a precisão.
  const startTimeRef      = useRef<number | null>(null)
  const secondsAtStartRef = useRef(DURATIONS.focus)

  const modeRef            = useRef<TimerMode>('focus')
  const focusCountRef      = useRef(0)
  const completedRef       = useRef(false)
  const onFocusCompleteRef = useRef(onFocusComplete)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { focusCountRef.current = focusCount }, [focusCount])
  useEffect(() => { onFocusCompleteRef.current = onFocusComplete }, [onFocusComplete])

  // ── função de tick baseada em wall clock ───────────────────────────────────
  const tick = useCallback(() => {
    if (!startTimeRef.current) return
    const elapsed    = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const remaining  = Math.max(0, secondsAtStartRef.current - elapsed)
    setSecondsLeft(remaining)
  }, [])

  // ── interval de 500ms para display fluido ─────────────────────────────────
  useEffect(() => {
    if (timerState !== 'running') return
    tick() // atualiza imediatamente ao iniciar/retomar
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [timerState, tick])

  // ── força atualização ao voltar para a aba ────────────────────────────────
  useEffect(() => {
    if (timerState !== 'running') return
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [timerState, tick])

  // ── handle de conclusão ───────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft !== 0 || timerState !== 'running' || completedRef.current) return
    completedRef.current = true

    setTimerState('completed')

    if (modeRef.current === 'focus') {
      const newCount = focusCountRef.current + 1
      setFocusCount(newCount)
      focusCountRef.current = newCount
      onFocusCompleteRef.current?.()

      const nextMode: TimerMode = newCount % 4 === 0 ? 'long_break' : 'short_break'
      setTimeout(() => {
        completedRef.current  = false
        startTimeRef.current  = null
        const dur = DURATIONS[nextMode]
        secondsAtStartRef.current = dur
        setMode(nextMode)
        modeRef.current = nextMode
        setSecondsLeft(dur)
        setTimerState('idle')
      }, 2000)
    } else {
      setTimeout(() => {
        completedRef.current  = false
        startTimeRef.current  = null
        const dur = DURATIONS.focus
        secondsAtStartRef.current = dur
        setMode('focus')
        modeRef.current = 'focus'
        setSecondsLeft(dur)
        setTimerState('idle')
      }, 2000)
    }
  }, [secondsLeft, timerState])

  // ── controles ─────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    startTimeRef.current      = Date.now()
    secondsAtStartRef.current = secondsLeft
    setTimerState('running')
  }, [secondsLeft])

  const pause = useCallback(() => {
    startTimeRef.current = null
    setTimerState('paused')
  }, [])

  const resume = useCallback(() => {
    startTimeRef.current      = Date.now()
    secondsAtStartRef.current = secondsLeft
    setTimerState('running')
  }, [secondsLeft])

  const reset = useCallback(() => {
    completedRef.current      = false
    startTimeRef.current      = null
    const dur = DURATIONS[modeRef.current]
    secondsAtStartRef.current = dur
    setTimerState('idle')
    setSecondsLeft(dur)
  }, [])

  const switchMode = useCallback((newMode: TimerMode) => {
    completedRef.current      = false
    startTimeRef.current      = null
    const dur = DURATIONS[newMode]
    secondsAtStartRef.current = dur
    setMode(newMode)
    modeRef.current = newMode
    setSecondsLeft(dur)
    setTimerState('idle')
  }, [])

  // ── valores derivados ─────────────────────────────────────────────────────
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const cyclePosition = focusCount % 4

  return {
    mode,
    timerState,
    display,
    secondsLeft,
    focusCount,
    cyclePosition,
    modeLabel: MODE_LABELS[mode],
    start,
    pause,
    resume,
    reset,
    switchMode,
  }
}

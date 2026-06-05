'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerMode = 'focus' | 'short_break' | 'long_break'
export type TimerState = 'idle' | 'running' | 'paused' | 'completed'

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Foco',
  short_break: 'Pausa curta',
  long_break: 'Pausa longa',
}

interface UseTimerOptions {
  onFocusComplete?: () => void
  focusMinutes?: number
  shortBreakMinutes?: number
  longBreakMinutes?: number
}

export function useTimer({
  onFocusComplete,
  focusMinutes = 25,
  shortBreakMinutes = 5,
  longBreakMinutes = 15,
}: UseTimerOptions = {}) {
  const [mode, setMode]             = useState<TimerMode>('focus')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
  const [focusCount, setFocusCount] = useState(0)

  const durationsRef = useRef({
    focus:       focusMinutes * 60,
    short_break: shortBreakMinutes * 60,
    long_break:  longBreakMinutes * 60,
  })
  const startTimeRef        = useRef<number | null>(null)
  const secondsAtStartRef   = useRef(focusMinutes * 60)
  const modeRef             = useRef<TimerMode>('focus')
  const timerStateRef       = useRef<TimerState>('idle')
  const focusCountRef       = useRef(0)
  const completedRef        = useRef(false)
  const onFocusCompleteRef  = useRef(onFocusComplete)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { timerStateRef.current = timerState }, [timerState])
  useEffect(() => { focusCountRef.current = focusCount }, [focusCount])
  useEffect(() => { onFocusCompleteRef.current = onFocusComplete }, [onFocusComplete])

  // Atualiza durações quando as props mudam
  useEffect(() => {
    durationsRef.current = {
      focus:       focusMinutes * 60,
      short_break: shortBreakMinutes * 60,
      long_break:  longBreakMinutes * 60,
    }
    // Se idle, atualiza o display imediatamente
    if (timerStateRef.current === 'idle') {
      const newSecs = durationsRef.current[modeRef.current]
      secondsAtStartRef.current = newSecs
      setSecondsLeft(newSecs)
    }
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes])

  // ── Countdown via wall clock ───────────────────────────────────────────────
  const tick = useCallback(() => {
    if (!startTimeRef.current) return
    const elapsed   = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const remaining = Math.max(0, secondsAtStartRef.current - elapsed)
    setSecondsLeft(remaining)
  }, [])

  useEffect(() => {
    if (timerState !== 'running') return
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [timerState, tick])

  useEffect(() => {
    if (timerState !== 'running') return
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [timerState, tick])

  // ── Handle zero ───────────────────────────────────────────────────────────
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
        const dur = durationsRef.current[nextMode]
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
        const dur = durationsRef.current.focus
        secondsAtStartRef.current = dur
        setMode('focus')
        modeRef.current = 'focus'
        setSecondsLeft(dur)
        setTimerState('idle')
      }, 2000)
    }
  }, [secondsLeft, timerState])

  // ── Controles ─────────────────────────────────────────────────────────────
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
    const dur = durationsRef.current[modeRef.current]
    secondsAtStartRef.current = dur
    setTimerState('idle')
    setSecondsLeft(dur)
  }, [])

  const switchMode = useCallback((newMode: TimerMode) => {
    completedRef.current      = false
    startTimeRef.current      = null
    const dur = durationsRef.current[newMode]
    secondsAtStartRef.current = dur
    setMode(newMode)
    modeRef.current = newMode
    setSecondsLeft(dur)
    setTimerState('idle')
  }, [])

  const minutes      = Math.floor(secondsLeft / 60)
  const seconds      = secondsLeft % 60
  const display      = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const cyclePosition = focusCount % 4

  return {
    mode, timerState, display, secondsLeft,
    focusCount, cyclePosition, modeLabel: MODE_LABELS[mode],
    start, pause, resume, reset, switchMode,
  }
}

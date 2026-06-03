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
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus)
  const [focusCount, setFocusCount] = useState(0)

  const modeRef = useRef<TimerMode>('focus')
  const focusCountRef = useRef(0)
  const completedRef = useRef(false)
  const onFocusCompleteRef = useRef(onFocusComplete)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { focusCountRef.current = focusCount }, [focusCount])
  useEffect(() => { onFocusCompleteRef.current = onFocusComplete }, [onFocusComplete])

  // Countdown
  useEffect(() => {
    if (timerState !== 'running') return
    const id = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [timerState])

  // Handle zero — guarded by completedRef to fire exactly once
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
        completedRef.current = false
        setMode(nextMode)
        modeRef.current = nextMode
        setSecondsLeft(DURATIONS[nextMode])
        setTimerState('idle')
      }, 2000)
    } else {
      setTimeout(() => {
        completedRef.current = false
        setMode('focus')
        modeRef.current = 'focus'
        setSecondsLeft(DURATIONS.focus)
        setTimerState('idle')
      }, 2000)
    }
  }, [secondsLeft, timerState])

  const start = useCallback(() => setTimerState('running'), [])
  const pause = useCallback(() => setTimerState('paused'), [])
  const resume = useCallback(() => setTimerState('running'), [])

  const reset = useCallback(() => {
    completedRef.current = false
    setTimerState('idle')
    setSecondsLeft(DURATIONS[modeRef.current])
  }, [])

  const switchMode = useCallback((newMode: TimerMode) => {
    completedRef.current = false
    setMode(newMode)
    modeRef.current = newMode
    setSecondsLeft(DURATIONS[newMode])
    setTimerState('idle')
  }, [])

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

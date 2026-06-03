export function playBeep() {
  try {
    const AudioCtx = (
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )
    const ctx = new AudioCtx()

    function tone(freq: number, startAt: number, dur: number, vol = 0.25) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + startAt)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + dur)
      osc.start(ctx.currentTime + startAt)
      osc.stop(ctx.currentTime + startAt + dur + 0.05)
    }

    // Three ascending tones
    tone(440, 0, 0.15)
    tone(550, 0.2, 0.15)
    tone(660, 0.4, 0.5)
  } catch {
    // silently fail — AudioContext may be blocked
  }
}

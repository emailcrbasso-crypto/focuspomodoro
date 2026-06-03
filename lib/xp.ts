export const XP_PER_POMODORO = 10
export const XP_PER_TASK = 5

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function xpForLevel(level: number): number {
  return 50 * Math.pow(level - 1, 2)
}

export function levelProgress(xp: number) {
  const level = xpToLevel(xp)
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  const current = xp - start
  const needed = end - start
  return {
    level,
    current,
    needed,
    percent: needed > 0 ? Math.round((current / needed) * 100) : 100,
  }
}

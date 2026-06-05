import { levelProgress } from '@/lib/xp'

interface Props {
  xp: number
  level: number
  streak: number
}

export default function XPBar({ xp, level, streak }: Props) {
  const { current, needed, percent } = levelProgress(xp)

  return (
    <div className="hidden sm:flex items-center gap-3">
      {streak > 0 && (
        <span className="text-xs font-semibold text-orange-500">
          🔥 {streak}d
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">Nv {level}</span>
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e74c3c] rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{current}/{needed}</span>
      </div>
    </div>
  )
}

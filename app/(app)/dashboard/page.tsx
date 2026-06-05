import { createClient } from '@/lib/supabase/server'
import { levelProgress } from '@/lib/xp'

function BarChart({ data }: { data: { date: string; pomodoros_completed: number }[] }) {
  const max = Math.max(...data.map(d => d.pomodoros_completed), 1)
  return (
    <div className="flex items-end gap-2" style={{ height: 120 }}>
      {data.map(d => {
        const pct   = (d.pomodoros_completed / max) * 100
        const label = new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            {d.pomodoros_completed > 0 && (
              <span className="text-[11px] font-semibold text-gray-500">{d.pomodoros_completed}</span>
            )}
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(pct, d.pomodoros_completed > 0 ? 8 : 2)}%`,
                  backgroundColor: d.pomodoros_completed > 0 ? '#e74c3c' : '#e5e7eb',
                  minHeight: 2,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 capitalize">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const [{ data: profile }, { data: statsRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, level, xp, current_streak, best_streak, total_pomodoros')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('daily_stats')
      .select('date, pomodoros_completed, minutes_focused, tasks_completed, xp_earned')
      .eq('user_id', user!.id)
      .in('date', days),
  ])

  // Preenche dias sem registro com zeros
  const statsMap = Object.fromEntries((statsRows ?? []).map(s => [s.date, s]))
  const chartData = days.map(d => ({ date: d, pomodoros_completed: statsMap[d]?.pomodoros_completed ?? 0 }))

  const todayStat = statsMap[today.toISOString().split('T')[0]]
  const weekTotal = chartData.reduce((s, d) => s + d.pomodoros_completed, 0)
  const bestDay   = Math.max(...chartData.map(d => d.pomodoros_completed), 0)

  const lvl = profile ? levelProgress(profile.xp) : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1f2330]">Dashboard</h1>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Hoje',          value: todayStat?.pomodoros_completed ?? 0, icon: '🍅' },
          { label: 'Essa semana',   value: weekTotal,                            icon: '📅' },
          { label: 'Sequência',     value: `${profile?.current_streak ?? 0}d`,  icon: '🔥' },
          { label: 'Melhor dia',    value: bestDay,                              icon: '⭐' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#1f2330]">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{icon} {label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico 7 dias */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2330] mb-4">Pomodoros — últimos 7 dias</h2>
        <BarChart data={chartData} />
      </div>

      {/* Nível e XP */}
      {profile && lvl && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1f2330]">Nível {lvl.level}</h2>
            <span className="text-sm text-gray-500">{profile.xp} XP total</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e74c3c] rounded-full transition-all duration-700"
              style={{ width: `${lvl.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{lvl.current} XP</span>
            <span>{lvl.needed} XP para nível {lvl.level + 1}</span>
          </div>
        </div>
      )}

      {/* Totais de vida */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total pomodoros', value: profile.total_pomodoros },
            { label: 'Total horas',     value: `${Math.floor((profile.total_pomodoros * 25) / 60)}h ${(profile.total_pomodoros * 25) % 60}min` },
            { label: 'Melhor sequência',value: `${profile.best_streak} dias` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xl font-bold text-[#1f2330]">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

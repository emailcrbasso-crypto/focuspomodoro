import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: recentStats }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, level, xp, current_streak, best_streak, total_pomodoros')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('daily_stats')
      .select('date, pomodoros_completed, minutes_focused, tasks_completed, xp_earned')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(7),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1f2330]">Dashboard</h1>

      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Nível', value: profile.level },
            { label: 'XP total', value: profile.xp },
            { label: 'Sequência atual', value: `${profile.current_streak}d` },
            { label: 'Total pomodoros', value: profile.total_pomodoros },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-[#1f2330]">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2330] mb-4">Últimos 7 dias</h2>
        {recentStats && recentStats.length > 0 ? (
          <div className="space-y-2">
            {recentStats.map((s) => (
              <div key={s.date} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                <span className="font-medium">{s.pomodoros_completed} 🍅</span>
                <span className="text-gray-500">{s.minutes_focused} min</span>
                <span className="text-gray-500">{s.tasks_completed} tarefas</span>
                <span className="text-[#e74c3c] font-medium">+{s.xp_earned} XP</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma sessão registrada ainda. Use o timer para começar.</p>
        )}
      </div>
    </div>
  )
}

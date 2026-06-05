import { createClient } from '@/lib/supabase/server'

const ACHIEVEMENT_REQUIREMENTS: Record<string, string> = {
  first_pomodoro: 'Complete seu primeiro pomodoro',
  streak_7:       'Mantenha 7 dias consecutivos de foco',
  total_50:       'Complete 50 pomodoros no total',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allAchievements }, { data: earned }] = await Promise.all([
    supabase.from('achievements').select('*').order('xp_reward', { ascending: true }),
    supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user!.id),
  ])

  const earnedMap = Object.fromEntries(
    (earned ?? []).map(e => [e.achievement_id, e.earned_at])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1f2330]">Conquistas</h1>
        <p className="text-sm text-gray-500 mt-1">
          {earned?.length ?? 0} de {allAchievements?.length ?? 0} desbloqueadas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(allAchievements ?? []).map(a => {
          const isEarned   = !!earnedMap[a.id]
          const earnedDate = earnedMap[a.id]
            ? new Date(earnedMap[a.id]).toLocaleDateString('pt-BR')
            : null

          return (
            <div
              key={a.id}
              className={`rounded-2xl p-6 shadow-sm text-center space-y-3 transition-all ${
                isEarned
                  ? 'bg-white border-2 border-[#e74c3c]/20'
                  : 'bg-white opacity-50 grayscale'
              }`}
            >
              <div className="text-5xl">{isEarned ? a.icon : '🔒'}</div>
              <div>
                <p className={`font-bold text-base ${isEarned ? 'text-[#1f2330]' : 'text-gray-500'}`}>
                  {a.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{a.description}</p>
              </div>
              <div>
                {isEarned ? (
                  <span className="inline-block text-xs font-semibold text-[#e74c3c] bg-[#fde8e4] px-3 py-1 rounded-full">
                    ✓ Desbloqueada em {earnedDate}
                  </span>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    {ACHIEVEMENT_REQUIREMENTS[a.code] ?? 'Complete os requisitos'}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">+{a.xp_reward} XP</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

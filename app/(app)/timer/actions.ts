'use server'

import { createClient } from '@/lib/supabase/server'
import { xpToLevel, XP_PER_POMODORO, XP_PER_TASK } from '@/lib/xp'
import { revalidatePath } from 'next/cache'

export async function completeFocusSession(taskId: string | null): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now   = new Date()
  const today = now.toISOString().split('T')[0]

  // 1. Registra sessão
  await supabase.from('pomodoro_sessions').insert({
    user_id:          user.id,
    task_id:          taskId,
    session_type:     'focus',
    duration_minutes: 25,
    completed:        true,
    started_at:       new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    ended_at:         now.toISOString(),
  })

  // 2. Upsert daily_stats
  const { data: existingStat } = await supabase
    .from('daily_stats')
    .select('id, pomodoros_completed, minutes_focused, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const isFirstSessionToday = !existingStat

  if (existingStat) {
    await supabase.from('daily_stats').update({
      pomodoros_completed: existingStat.pomodoros_completed + 1,
      minutes_focused:     existingStat.minutes_focused + 25,
      xp_earned:           existingStat.xp_earned + XP_PER_POMODORO,
    }).eq('id', existingStat.id)
  } else {
    await supabase.from('daily_stats').insert({
      user_id: user.id, date: today,
      pomodoros_completed: 1, minutes_focused: 25, xp_earned: XP_PER_POMODORO,
    })
  }

  // 3. Busca perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, total_pomodoros, current_streak, best_streak')
    .eq('id', user.id)
    .single()

  if (!profile) return

  const newXp            = profile.xp + XP_PER_POMODORO
  const newTotalPomodoros = profile.total_pomodoros + 1

  // 4. Streak — só atualiza na primeira sessão do dia
  let newStreak     = profile.current_streak
  let newBestStreak = profile.best_streak

  if (isFirstSessionToday) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const { data: yesterdayStat } = await supabase
      .from('daily_stats')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', yesterday.toISOString().split('T')[0])
      .maybeSingle()

    newStreak     = yesterdayStat ? profile.current_streak + 1 : 1
    newBestStreak = Math.max(profile.best_streak, newStreak)
  }

  // 5. Atualiza perfil
  await supabase.from('profiles').update({
    xp:              newXp,
    level:           xpToLevel(newXp),
    total_pomodoros: newTotalPomodoros,
    current_streak:  newStreak,
    best_streak:     newBestStreak,
  }).eq('id', user.id)

  // 6. Incrementa pomodoros na tarefa
  if (taskId) {
    const { data: task } = await supabase
      .from('tasks')
      .select('completed_pomodoros')
      .eq('id', taskId)
      .single()
    if (task) {
      await supabase.from('tasks')
        .update({ completed_pomodoros: task.completed_pomodoros + 1 })
        .eq('id', taskId)
    }
  }

  // 7. Verifica e desbloqueia conquistas
  const [{ data: earned }, { data: allAchievements }] = await Promise.all([
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    supabase.from('achievements').select('id, code, xp_reward'),
  ])

  const earnedIds = new Set(earned?.map(e => e.achievement_id) ?? [])

  const toUnlock = (allAchievements ?? []).filter(a => {
    if (earnedIds.has(a.id)) return false
    if (a.code === 'first_pomodoro') return newTotalPomodoros >= 1
    if (a.code === 'streak_7')       return newStreak >= 7
    if (a.code === 'total_50')       return newTotalPomodoros >= 50
    return false
  })

  if (toUnlock.length > 0) {
    await supabase.from('user_achievements').insert(
      toUnlock.map(a => ({ user_id: user.id, achievement_id: a.id }))
    )
    // Bonus XP pelas conquistas
    const bonusXp = toUnlock.reduce((sum, a) => sum + (a.xp_reward ?? 0), 0)
    if (bonusXp > 0) {
      const finalXp = newXp + bonusXp
      await supabase.from('profiles').update({
        xp:    finalXp,
        level: xpToLevel(finalXp),
      }).eq('id', user.id)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/achievements')
}

export async function completeTaskWithStats(taskId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]

  await supabase.from('tasks').update({ done: true }).eq('id', taskId)

  const { data: stat } = await supabase
    .from('daily_stats')
    .select('id, tasks_completed, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  if (stat) {
    await supabase.from('daily_stats').update({
      tasks_completed: stat.tasks_completed + 1,
      xp_earned:       stat.xp_earned + XP_PER_TASK,
    }).eq('id', stat.id)
  } else {
    await supabase.from('daily_stats').insert({
      user_id: user.id, date: today,
      tasks_completed: 1, xp_earned: XP_PER_TASK,
    })
  }

  const { data: profile } = await supabase
    .from('profiles').select('xp').eq('id', user.id).single()

  if (profile) {
    const newXp = profile.xp + XP_PER_TASK
    await supabase.from('profiles').update({
      xp: newXp, level: xpToLevel(newXp),
    }).eq('id', user.id)
  }

  revalidatePath('/dashboard')
}

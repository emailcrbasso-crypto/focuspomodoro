'use server'

import { createClient } from '@/lib/supabase/server'
import { xpToLevel, XP_PER_POMODORO, XP_PER_TASK } from '@/lib/xp'
import { revalidatePath } from 'next/cache'

export async function completeFocusSession(taskId: string | null): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // 1. Registra a sessão
  await supabase.from('pomodoro_sessions').insert({
    user_id: user.id,
    task_id: taskId,
    session_type: 'focus',
    duration_minutes: 25,
    completed: true,
    started_at: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    ended_at: now.toISOString(),
  })

  // 2. Atualiza daily_stats
  const { data: stat } = await supabase
    .from('daily_stats')
    .select('id, pomodoros_completed, minutes_focused, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  if (stat) {
    await supabase.from('daily_stats').update({
      pomodoros_completed: stat.pomodoros_completed + 1,
      minutes_focused: stat.minutes_focused + 25,
      xp_earned: stat.xp_earned + XP_PER_POMODORO,
    }).eq('id', stat.id)
  } else {
    await supabase.from('daily_stats').insert({
      user_id: user.id,
      date: today,
      pomodoros_completed: 1,
      minutes_focused: 25,
      xp_earned: XP_PER_POMODORO,
    })
  }

  // 3. Atualiza perfil (XP + nível + total)
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, total_pomodoros')
    .eq('id', user.id)
    .single()

  if (profile) {
    const newXp = profile.xp + XP_PER_POMODORO
    await supabase.from('profiles').update({
      xp: newXp,
      level: xpToLevel(newXp),
      total_pomodoros: profile.total_pomodoros + 1,
    }).eq('id', user.id)
  }

  // 4. Incrementa completed_pomodoros da tarefa
  if (taskId) {
    const { data: task } = await supabase
      .from('tasks')
      .select('completed_pomodoros')
      .eq('id', taskId)
      .single()

    if (task) {
      await supabase.from('tasks').update({
        completed_pomodoros: task.completed_pomodoros + 1,
      }).eq('id', taskId)
    }
  }

  revalidatePath('/dashboard')
}

export async function completeTaskWithStats(taskId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]

  // Marca tarefa como concluída
  await supabase.from('tasks').update({ done: true }).eq('id', taskId)

  // Atualiza daily_stats.tasks_completed + XP
  const { data: stat } = await supabase
    .from('daily_stats')
    .select('id, tasks_completed, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  if (stat) {
    await supabase.from('daily_stats').update({
      tasks_completed: stat.tasks_completed + 1,
      xp_earned: stat.xp_earned + XP_PER_TASK,
    }).eq('id', stat.id)
  } else {
    await supabase.from('daily_stats').insert({
      user_id: user.id,
      date: today,
      tasks_completed: 1,
      xp_earned: XP_PER_TASK,
    })
  }

  // XP no perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', user.id)
    .single()

  if (profile) {
    const newXp = profile.xp + XP_PER_TASK
    await supabase.from('profiles').update({
      xp: newXp,
      level: xpToLevel(newXp),
    }).eq('id', user.id)
  }

  revalidatePath('/dashboard')
}

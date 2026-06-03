'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types/database'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('done', false)
        .order('created_at', { ascending: true })

      if (data) {
        setTasks(data)
        setActiveTaskId(prev => prev ?? (data[0]?.id ?? null))
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addTask = useCallback(async (title: string, estimated = 1) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, estimated_pomodoros: estimated })
      .select()
      .single()

    if (data) {
      setTasks(prev => [...prev, data])
      setActiveTaskId(prev => prev ?? data.id)
    }
  }, [supabase])

  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'estimated_pomodoros'>>
  ) => {
    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
  }, [supabase])

  const completeTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setActiveTaskId(prev => prev === id ? null : prev)
    await supabase.from('tasks').update({ done: true }).eq('id', id)
  }, [supabase])

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setActiveTaskId(prev => prev === id ? null : prev)
    await supabase.from('tasks').delete().eq('id', id)
  }, [supabase])

  // Optimistic local-only increment (DB update handled by server action)
  const localIncrementPomodoro = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed_pomodoros: t.completed_pomodoros + 1 } : t
    ))
  }, [])

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null

  return {
    tasks,
    activeTask,
    activeTaskId,
    loading,
    setActiveTaskId,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    localIncrementPomodoro,
    supabase,
  }
}

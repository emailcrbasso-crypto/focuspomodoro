'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer, type TimerMode } from '@/hooks/useTimer'
import { useTasks } from '@/hooks/useTasks'
import { playBeep } from '@/lib/sounds'
import { completeFocusSession, completeTaskWithStats } from './actions'

// ─── cores por modo ────────────────────────────────────────────────────────
const COLORS: Record<TimerMode, { bg: string; accent: string }> = {
  focus:       { bg: '#fde8e4', accent: '#e74c3c' },
  short_break: { bg: '#e0ecff', accent: '#3b82f6' },
  long_break:  { bg: '#d8f5e9', accent: '#10b981' },
}

// ─── tipos ─────────────────────────────────────────────────────────────────
interface Stats { pomodoros: number; minutes: number; tasks: number }

export default function TimerPage() {
  const [stats, setStats]           = useState<Stats>({ pomodoros: 0, minutes: 0, tasks: 0 })
  const [newTitle, setNewTitle]     = useState('')
  const [newEst, setNewEst]         = useState(1)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editValue, setEditValue]   = useState('')
  const [saving, setSaving]         = useState(false)

  const {
    tasks, activeTask, activeTaskId, loading,
    setActiveTaskId, addTask, updateTask, completeTask, deleteTask,
    localIncrementPomodoro, supabase,
  } = useTasks()

  // ── fetch stats do dia ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_stats')
      .select('pomodoros_completed, minutes_focused, tasks_completed')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
    if (data) setStats({ pomodoros: data.pomodoros_completed, minutes: data.minutes_focused, tasks: data.tasks_completed })
  }, [supabase])

  useEffect(() => { fetchStats() }, [fetchStats])

  // ── callback de conclusão de foco ─────────────────────────────────────────
  const activeTaskIdRef = useRef(activeTaskId)
  useEffect(() => { activeTaskIdRef.current = activeTaskId }, [activeTaskId])

  const handleFocusComplete = useCallback(async () => {
    playBeep()
    const prevTitle = document.title
    document.title = '✅ Sessão concluída! — Focus Pomodoro'
    setTimeout(() => { document.title = prevTitle }, 3000)

    const tid = activeTaskIdRef.current
    if (tid) localIncrementPomodoro(tid)

    setSaving(true)
    try {
      await completeFocusSession(tid)
      await fetchStats()
    } catch (e) {
      console.error('Erro ao salvar sessão:', e)
    } finally {
      setSaving(false)
    }
  }, [localIncrementPomodoro, fetchStats])

  const timer = useTimer({ onFocusComplete: handleFocusComplete })

  // ── handlers de tarefas ───────────────────────────────────────────────────
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addTask(newTitle.trim(), newEst)
    setNewTitle('')
    setNewEst(1)
  }

  async function handleCompleteTask(id: string) {
    if (id === activeTaskId) timer.reset()
    setTasks_localRemove(id)
    setSaving(true)
    try {
      await completeTaskWithStats(id)
      await fetchStats()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // remover tarefa do estado local sem chamar o hook (o server action já cuida do DB)
  function setTasks_localRemove(id: string) {
    completeTask(id) // o hook já faz a remoção local e marca done no DB — aqui é redundante no DB, mas ok
  }

  async function handleEditSave(id: string) {
    if (editValue.trim()) await updateTask(id, { title: editValue.trim() })
    setEditingId(null)
  }

  // ── estado derivado ───────────────────────────────────────────────────────
  const { mode, timerState, display, cyclePosition } = timer
  const colors = COLORS[mode]
  const isRunning   = timerState === 'running'
  const isPaused    = timerState === 'paused'
  const isIdle      = timerState === 'idle'
  const isCompleted = timerState === 'completed'
  const canStart    = isIdle && !!activeTaskId

  let stateLabel = 'PRONTO'
  if (isCompleted) stateLabel = 'SESSÃO CONCLUÍDA ✓'
  else if (isPaused) stateLabel = 'PAUSADO'
  else if (isRunning) {
    stateLabel = mode === 'focus' ? 'FOCO EM ANDAMENTO'
      : mode === 'short_break' ? 'PAUSA CURTA'
      : 'PAUSA LONGA'
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

        {/* ── Timer card ───────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 shadow-sm transition-colors duration-500 min-h-[420px] flex flex-col"
          style={{ backgroundColor: colors.bg }}
        >
          {/* Mode tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {(['focus', 'short_break', 'long_break'] as TimerMode[]).map(m => (
              <button
                key={m}
                onClick={() => timer.switchMode(m)}
                disabled={isRunning}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                  mode === m
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={mode === m ? { color: colors.accent } : {}}
              >
                {m === 'focus' ? 'Foco' : m === 'short_break' ? 'Pausa curta' : 'Pausa longa'}
              </button>
            ))}
          </div>

          {/* Tempo */}
          <div className="text-center flex-1 flex flex-col items-center justify-center gap-2 mb-6">
            <p
              className="text-8xl font-bold tabular-nums tracking-tight leading-none"
              style={{ color: colors.accent }}
            >
              {display}
            </p>
            <p className="text-xs font-semibold tracking-widest text-gray-500 mt-1">
              {stateLabel}
              {saving && <span className="ml-2 text-gray-400">— salvando…</span>}
            </p>
          </div>

          {/* Tarefa ativa */}
          <div className="text-center mb-6 min-h-[20px]">
            {activeTask ? (
              <p className="text-sm text-gray-600">
                Tarefa ativa:{' '}
                <span className="font-semibold text-[#1f2330]">{activeTask.title}</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({activeTask.completed_pomodoros}/{activeTask.estimated_pomodoros})
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nenhuma tarefa selecionada</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-center gap-3 mb-6">
            {isIdle && (
              <button
                onClick={timer.start}
                disabled={!canStart}
                className="px-8 py-3 rounded-xl font-semibold text-white transition cursor-pointer disabled:cursor-not-allowed"
                style={{ backgroundColor: canStart ? colors.accent : '#d1d5db' }}
              >
                Iniciar
              </button>
            )}
            {isRunning && (
              <button
                onClick={timer.pause}
                className="px-8 py-3 rounded-xl font-semibold text-white transition cursor-pointer"
                style={{ backgroundColor: colors.accent }}
              >
                Pausar
              </button>
            )}
            {isPaused && (
              <button
                onClick={timer.resume}
                className="px-8 py-3 rounded-xl font-semibold text-white transition cursor-pointer"
                style={{ backgroundColor: colors.accent }}
              >
                Retomar
              </button>
            )}
            {(isRunning || isPaused) && (
              <button
                onClick={timer.reset}
                className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                Resetar
              </button>
            )}
            {isCompleted && (
              <button
                disabled
                className="px-8 py-3 rounded-xl font-semibold text-white opacity-60 cursor-wait"
                style={{ backgroundColor: colors.accent }}
              >
                Aguardando…
              </button>
            )}
          </div>

          {/* Dica sem tarefa */}
          {!activeTaskId && isIdle && (
            <p className="text-center text-xs text-gray-400 mb-4">
              Selecione ou adicione uma tarefa para iniciar o foco.
            </p>
          )}

          {/* Ciclos */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-colors duration-300"
                style={{ backgroundColor: i < cyclePosition ? colors.accent : '#d1d5db' }}
              />
            ))}
            <span className="text-xs text-gray-400 ml-2">ciclos até pausa longa</span>
          </div>
        </div>

        {/* ── Task list ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#1f2330]">Tarefas do dia</h2>

          {/* Formulário de nova tarefa */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Nova tarefa…"
              maxLength={80}
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
            <input
              type="number"
              value={newEst}
              min={1}
              max={20}
              onChange={e => setNewEst(Math.max(1, Math.min(20, Number(e.target.value))))}
              title="Pomodoros estimados"
              className="w-12 border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-2.5 bg-[#1f2330] text-white rounded-xl text-sm font-semibold hover:bg-[#2d3347] transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              + Add
            </button>
          </form>

          {/* Lista */}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Carregando…</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma tarefa ainda. Adicione a primeira acima.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(task => {
                const isActive = activeTaskId === task.id
                return (
                  <li
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    className={`group flex items-center gap-2 p-3 rounded-xl border-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#e74c3c] bg-[#fde8e4]/30'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded cursor-pointer accent-[#e74c3c] shrink-0"
                      onClick={e => { e.stopPropagation(); handleCompleteTask(task.id) }}
                      readOnly
                    />

                    {/* Título ou edição */}
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave(task.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave(task.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          onClick={e => e.stopPropagation()}
                          className="w-full text-sm border-b border-[#e74c3c] outline-none bg-transparent"
                        />
                      ) : (
                        <span
                          className="text-sm text-[#1f2330] truncate block"
                          onDoubleClick={e => {
                            e.stopPropagation()
                            setEditingId(task.id)
                            setEditValue(task.title)
                          }}
                          title="Duplo clique para editar"
                        >
                          {task.title}
                        </span>
                      )}
                    </div>

                    {/* Progresso */}
                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                      {task.completed_pomodoros}/{task.estimated_pomodoros}
                    </span>

                    {/* Badge ativa */}
                    {isActive && (
                      <span className="text-xs font-bold shrink-0" style={{ color: '#e74c3c' }}>
                        Ativa
                      </span>
                    )}

                    {/* Excluir */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteTask(task.id) }}
                      className="text-gray-300 hover:text-red-500 transition cursor-pointer shrink-0 text-lg leading-none opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Resumo do dia ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#1f2330] mb-4">Resumo do dia</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Pomodoros', value: stats.pomodoros, icon: '🍅' },
            { label: 'Minutos focados', value: stats.minutes, icon: '⏱' },
            { label: 'Tarefas concluídas', value: stats.tasks, icon: '✅' },
          ].map(({ label, value, icon }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[#1f2330]">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{icon} {label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

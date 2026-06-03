export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  level: number
  xp: number
  current_streak: number
  best_streak: number
  total_pomodoros: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  estimated_pomodoros: number
  completed_pomodoros: number
  done: boolean
  created_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id: string | null
  session_type: 'focus' | 'short_break' | 'long_break'
  duration_minutes: number
  completed: boolean
  started_at: string
  ended_at: string | null
}

export interface DailyStat {
  id: string
  user_id: string
  date: string
  pomodoros_completed: number
  minutes_focused: number
  tasks_completed: number
  xp_earned: number
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  xp_reward: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

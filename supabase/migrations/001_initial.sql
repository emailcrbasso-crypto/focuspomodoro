-- Focus Pomodoro — schema inicial
-- Rodar no SQL Editor do Supabase

-- ────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  username        text unique,
  avatar_url      text,
  level           integer not null default 1,
  xp              integer not null default 0,
  current_streak  integer not null default 0,
  best_streak     integer not null default 0,
  total_pomodoros integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuário lê próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ────────────────────────────────────────────────
-- tasks
-- ────────────────────────────────────────────────
create table public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  title               text not null,
  estimated_pomodoros integer not null default 1,
  completed_pomodoros integer not null default 0,
  done                boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Usuário gerencia próprias tarefas"
  on public.tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- pomodoro_sessions
-- ────────────────────────────────────────────────
create table public.pomodoro_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  task_id          uuid references public.tasks(id) on delete set null,
  session_type     text not null check (session_type in ('focus', 'short_break', 'long_break')),
  duration_minutes integer not null,
  completed        boolean not null default false,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz
);

alter table public.pomodoro_sessions enable row level security;

create policy "Usuário gerencia próprias sessões"
  on public.pomodoro_sessions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- daily_stats
-- ────────────────────────────────────────────────
create table public.daily_stats (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  date                date not null,
  pomodoros_completed integer not null default 0,
  minutes_focused     integer not null default 0,
  tasks_completed     integer not null default 0,
  xp_earned           integer not null default 0,
  unique (user_id, date)
);

alter table public.daily_stats enable row level security;

create policy "Usuário gerencia próprias estatísticas"
  on public.daily_stats
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- achievements
-- ────────────────────────────────────────────────
create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  description text not null,
  icon        text not null,
  xp_reward   integer not null default 0
);

-- Conquistas iniciais
insert into public.achievements (code, name, description, icon, xp_reward) values
  ('first_pomodoro', 'Primeiro foco',   'Completou o primeiro pomodoro',       '🍅', 20),
  ('streak_7',       'Semana focada',   'Manteve 7 dias consecutivos de foco', '🔥', 100),
  ('total_50',       'Meio century',    'Completou 50 pomodoros no total',     '⭐', 200);

-- ────────────────────────────────────────────────
-- user_achievements
-- ────────────────────────────────────────────────
create table public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at      timestamptz not null default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Usuário vê próprias conquistas"
  on public.user_achievements for select
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- trigger: cria perfil automaticamente no signup
-- ────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

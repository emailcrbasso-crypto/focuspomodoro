import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import InstallPrompt from '@/components/InstallPrompt'
import XPBar from '@/components/XPBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, level, xp, current_streak')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          <div className="flex items-center gap-5 min-w-0">
            <Link href="/timer" className="text-lg font-bold text-[#1f2330] shrink-0">
              🍅 Focus
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/timer"        className="text-gray-600 hover:text-[#e74c3c] transition font-medium">Timer</Link>
              <Link href="/dashboard"    className="text-gray-600 hover:text-[#e74c3c] transition font-medium">Dashboard</Link>
              <Link href="/achievements" className="text-gray-600 hover:text-[#e74c3c] transition font-medium">Conquistas</Link>
              <Link href="/settings"     className="text-gray-600 hover:text-[#e74c3c] transition font-medium">Configurações</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {profile && (
              <XPBar xp={profile.xp} level={profile.level} streak={profile.current_streak} />
            )}
            <span className="text-sm text-gray-700 font-medium hidden sm:block">{displayName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      <InstallPrompt />
    </div>
  )
}

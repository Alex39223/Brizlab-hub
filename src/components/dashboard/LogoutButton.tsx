'use client'

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={logout} className="btn-ghost w-full text-sm text-zinc-500 hover:text-red-400">
      <LogOut size={14} />
      Sign out
    </button>
  )
}

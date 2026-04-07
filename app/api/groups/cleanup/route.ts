import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date().toISOString()

  // 1. Find expired groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .lt('confirmation_deadline', now)
    .eq('status', 'forming')

  if (!groups || groups.length === 0) {
    return NextResponse.json({ message: 'No expired groups' })
  }

  for (const group of groups) {
    // 2. Get members
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)

    const confirmed = members?.filter(m => m.status === 'confirmed') || []

    if (confirmed.length >= group.min_confirmations) {
      // ✅ Group survives
      await supabase
        .from('groups')
        .update({ status: 'confirmed' })
        .eq('id', group.id)
    } else {
      // ❌ Group dies → remove members so they can be re-matched
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)

      await supabase
        .from('groups')
        .update({ status: 'expired' })
        .eq('id', group.id)
    }
  }

  return NextResponse.json({ success: true })
}
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // 🔒 0. Prevent duplicate matching
    const { data: existingMembership } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingMembership) {
      return NextResponse.json({ message: 'User already matched' })
    }

    // 1. Get user preferences
    const { data: user, error: userError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Get candidates
    const { data: candidates } = await supabase
      .from('user_preferences')
      .select('*')
      .neq('user_id', userId)
      .eq('city', user.city)

    if (!candidates) {
      return NextResponse.json({ message: 'No candidates found' })
    }

    // 🔒 Remove users already in groups
    const { data: existingMembers } = await supabase
      .from('group_members')
      .select('user_id')

    const groupedIds = new Set(existingMembers?.map(m => m.user_id))

    const availableCandidates = candidates.filter(c =>
      !groupedIds.has(c.user_id)
    )

    // 3. Match logic
    const matches = availableCandidates.filter(c =>
      c.interests.some((i: string) => user.interests.includes(i)) &&
      c.availability.some((a: string) => user.availability.includes(a))
    )

    if (!matches || matches.length < 3) {
      return NextResponse.json({ message: 'Not enough matches yet' })
    }

    const selected = matches.slice(0, 3)

    // 4. Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        city: user.city,
        interests: user.interests,
        status: 'forming'
      })
      .select()
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    // 5. Add members
    const members = [user, ...selected].map(u => ({
      group_id: group.id,
      user_id: u.user_id,
      status: 'pending'
    }))

    const { error: memberError } = await supabase
      .from('group_members')
      .insert(members)

    if (memberError) {
      return NextResponse.json({ error: 'Failed to add members' }, { status: 500 })
    }

    // 🔥 6. Anti-ghost system

    // ⏱ Meetup time = 2 days from now
    const meetupTime = new Date()
    meetupTime.setDate(meetupTime.getDate() + 2)

    // ⏱ Confirmation deadline = 24 hours
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + 24)

    await supabase
      .from('groups')
      .update({
        meetup_time: meetupTime,
        meetup_location: 'Coffee shop (TBD)',
        confirmation_deadline: deadline,
        min_confirmations: 3
      })
      .eq('id', group.id)

    return NextResponse.json({ success: true, group })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
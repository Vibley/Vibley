'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MatchPage() {
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noGroup, setNoGroup] = useState(false)

  useEffect(() => {
    loadGroup()
  }, [])

  async function loadGroup() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', user.id)
      .limit(1)

    if (!data || data.length === 0) {
      setNoGroup(true)
      setLoading(false)
      return
    }

    const groupData = data[0]

    setGroup(groupData.groups)

    const { data: memberData } = await supabase
      .from('group_members')
      .select('user_id, status')
      .eq('group_id', groupData.group_id)

    setMembers(memberData || [])
    setLoading(false)
  }

  async function confirmAttendance() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('group_members')
      .update({ status: 'confirmed' })
      .eq('user_id', user.id)

    loadGroup()
  }

  if (loading) {
    return <div className="p-6 text-white">Matching you...</div>
  }

  if (noGroup) {
    return (
      <div className="p-6 text-white text-center">
        <p className="mb-4">We’re still finding your group...</p>
        <button
          onClick={loadGroup}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    )
  }

  const confirmedCount = members.filter(m => m.status === 'confirmed').length

  const isExpired =
    group.confirmation_deadline &&
    new Date(group.confirmation_deadline) < new Date()

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Your group is ready 🎉</h1>

      <div className="mb-4">
        <p><strong>City:</strong> {group.city}</p>
        <p><strong>Interests:</strong> {group.interests.join(', ')}</p>
      </div>

      {/* 👥 Members */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Group Members</h2>
        {members.map((m, i) => (
          <div key={i} className="bg-gray-800 p-3 mb-2 rounded">
            Member {i + 1} — {m.status}
          </div>
        ))}
      </div>

      {/* 📍 Meetup */}
      <div className="bg-purple-900 p-4 rounded mb-4">
        <p className="font-bold mb-2">Meetup Details</p>

        <p>
          <strong>Time:</strong>{' '}
          {group.meetup_time
            ? new Date(group.meetup_time).toLocaleString()
            : 'Scheduling...'}
        </p>

        <p>
          <strong>Location:</strong>{' '}
          {group.meetup_location || 'TBD'}
        </p>

        <p className="mt-2 text-yellow-400">
          Confirm before:{' '}
          {group.confirmation_deadline
            ? new Date(group.confirmation_deadline).toLocaleString()
            : '—'}
        </p>

        <p>
          {confirmedCount} / {group.min_confirmations} confirmed
        </p>
      </div>

      {/* ✅ Confirm */}
      <button
        onClick={confirmAttendance}
        disabled={isExpired}
        className={`px-6 py-3 rounded w-full ${
          isExpired ? 'bg-gray-600' : 'bg-green-600'
        }`}
      >
        {isExpired ? 'Expired ❌' : 'I’m in ✅'}
      </button>
    </div>
  )
}
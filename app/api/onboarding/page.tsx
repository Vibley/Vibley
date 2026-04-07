'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()

  const [city, setCity] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [ageRange, setAgeRange] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleAvailability(value: string) {
    setAvailability(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  function cleanInterests(input: string) {
    return input
      .split(',')
      .map(i => i.trim().toLowerCase())
      .filter(i => i.length > 0)
  }

  async function handleSubmit() {
    if (!city || interests.length === 0 || availability.length === 0) {
      alert('Please complete all fields')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Not logged in')
      setLoading(false)
      return
    }

    // 1. Save preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        city: city.trim().toLowerCase(),
        interests,
        age_range: ageRange,
        availability
      })

    if (prefError) {
      alert('Failed to save preferences')
      setLoading(false)
      return
    }

    // 2. Trigger matching
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })

    const data = await res.json()

    console.log('Match response:', data)

    setLoading(false)
    router.push('/match')
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl mb-6">Get matched</h1>

      <input
        placeholder="City"
        className="w-full p-3 mb-4 bg-gray-800"
        onChange={e => setCity(e.target.value)}
      />

      <input
        placeholder="Interests (comma separated)"
        className="w-full p-3 mb-4 bg-gray-800"
        onChange={e => setInterests(cleanInterests(e.target.value))}
      />

      <input
        placeholder="Age range (e.g. 25-35)"
        className="w-full p-3 mb-4 bg-gray-800"
        onChange={e => setAgeRange(e.target.value)}
      />

      <div className="mb-4 flex gap-3">
        <button
          onClick={() => toggleAvailability('weekday')}
          className={`px-4 py-2 rounded ${
            availability.includes('weekday')
              ? 'bg-purple-600'
              : 'bg-gray-700'
          }`}
        >
          Weekday
        </button>

        <button
          onClick={() => toggleAvailability('weekend')}
          className={`px-4 py-2 rounded ${
            availability.includes('weekend')
              ? 'bg-purple-600'
              : 'bg-gray-700'
          }`}
        >
          Weekend
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-purple-600 px-6 py-3 rounded w-full"
      >
        {loading ? 'Matching...' : 'Find my group'}
      </button>
    </div>
  )
}
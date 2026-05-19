"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabase()

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setError(error.message)
        } else {
          setUser(user)
        }
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      {error && (
        <div style={{ color: "red" }}>
          Error: {error}
        </div>
      )}

      {user ? (
        <div>
          <p>Logged in</p>
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
        </div>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase()

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    run()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <p>Email: {user?.email}</p>
      <p>User ID: {user?.id}</p>
    </div>
  )
}
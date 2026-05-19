"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase()

      const { data } = await supabase.auth.getSession()

      const session = data.session

      if (!session) {
        router.replace("/auth/login")
        return
      }

      setEmail(session.user.email || "")
    }

    run()
  }, [])

  async function logout() {
    const supabase = getSupabase()

    await supabase.auth.signOut()

    router.replace("/auth/login")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>LifeKey Dashboard</h1>

      <p style={{ marginTop: 10 }}>
        当前用户：{email || "loading..."}
      </p>

      <button
        onClick={() => router.push("/dashboard/assets")}
        style={{ marginTop: 20, marginRight: 10 }}
      >
        我的数字遗产
      </button>

      <button onClick={logout} style={{ marginTop: 20 }}>
        退出登录
      </button>
    </div>
  )
}
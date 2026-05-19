"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/dashboard")
      }
    })
  }, [])

  const login = async () => {
    setLoading(true)

    try {
      const supabase = getSupabase()

      const { error } = await supabase.auth.signInWithOtp({
        email,
      })

      if (error) {
        alert(error.message)
      } else {
        alert("Check your email")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Sending..." : "Login"}
      </button>
    </div>
  )
}
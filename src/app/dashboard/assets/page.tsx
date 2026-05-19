"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase()

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("legacy_assets")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) return

      setAssets(data || [])
    }

    run()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Assets</h1>

      {assets.length === 0 ? (
        <p>No data</p>
      ) : (
        assets.map((item) => (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <h3>{item.title}</h3>
            <pre>{item.encrypted_data}</pre>
          </div>
        ))
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { decryptText } from "@/server/security/crypto"

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

      const result = (data || []).map((item) => {
        let decrypted = {}

        try {
          decrypted = decryptText(item.payload)
        } catch {
          decrypted = { error: "decrypt_failed" }
        }

        return {
          id: item.id,
          created_at: item.created_at,
          ...decrypted,
        }
      })

      setAssets(result)
    }

    run()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Assets</h1>

      {assets.length === 0 ? (
        <p>No data</p>
      ) : (
        assets.map((a) => (
          <div key={a.id}>
            <p>{a.title || "Untitled"}</p>
          </div>
        ))
      )}
    </div>
  )
}
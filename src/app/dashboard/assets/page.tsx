"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { decryptText } from "@/server/security/crypto"

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("legacy_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const parsed = data.map((item) => {
          let decrypted = null

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

        setAssets(parsed)
      }
    }

    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Assets</h1>

      {assets.length === 0 ? (
        <p>No data</p>
      ) : (
        <ul>
          {assets.map((a) => (
            <li key={a.id}>
              {a.title || "Untitled"} - {a.created_at}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
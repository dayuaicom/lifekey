"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"

export default function NewAssetPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function createAsset() {
    if (!title || !content || !password) {
      alert("请填写完整")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabase()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/login")
        return
      }

      // 👉 加密逻辑（必须改为 client-safe 或 API 处理）
      const encryptedPayload = {
        title,
        content,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("legacy_assets").insert({
        user_id: user.id,
        payload: JSON.stringify(encryptedPayload),
      })

      if (error) {
        alert(error.message)
        return
      }

      router.push("/dashboard/assets")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>新建数字遗产</h1>

      <input
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: 400, padding: 10, marginTop: 20, display: "block" }}
      />

      <textarea
        placeholder="遗产内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: 400, height: 200, padding: 10, marginTop: 20, display: "block" }}
      />

      <input
        type="password"
        placeholder="解密密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: 400, padding: 10, marginTop: 20, display: "block" }}
      />

      <button onClick={createAsset} disabled={loading} style={{ marginTop: 20 }}>
        {loading ? "保存中..." : "保存"}
      </button>
    </div>
  )
}
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { encryptPayload } from "@/lib/serverCrypto"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")

  return createClient(url, key)
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { user_id, title, content } = body

    if (!user_id) {
      return NextResponse.json({ error: "missing user_id" }, { status: 400 })
    }

    const encrypted = encryptPayload({
      title,
      content,
      createdAt: new Date().toISOString(),
    })

    const { error } = await supabase.from("legacy_assets").insert({
      user_id,
      payload: encrypted,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    )
  }
}
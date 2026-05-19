import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { decryptPayload } from "@/lib/serverCrypto"

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

    const { user_id } = await req.json()

    if (!user_id) {
      return NextResponse.json(
        { error: "missing user_id" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("legacy_assets")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const result = (data || []).map((item) => {
      let decrypted = null

      try {
        decrypted = decryptPayload(item.payload)
      } catch (err) {
        decrypted = {
          error: "decrypt_failed",
        }
      }

      return {
        id: item.id,
        created_at: item.created_at,
        ...decrypted,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    )
  }
}
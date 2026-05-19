import { getSupabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()

    const { data, error } = await supabase
      .from("heartbeat")
      .upsert([
        {
          ...body,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data,
    })
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encryptPayload } from "@/lib/serverCrypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, title, content } = body;

    const encrypted = encryptPayload({
      title,
      content,
      createdAt: new Date().toISOString(),
    });

    const { error } = await supabase.from("legacy_assets").insert({
      user_id,
      payload: encrypted,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
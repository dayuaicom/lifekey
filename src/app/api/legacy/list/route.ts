import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decryptPayload } from "@/lib/serverCrypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    const { data, error } = await supabase
      .from("legacy_assets")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = (data || []).map((item) => {
      const decrypted = decryptPayload(item.payload);

      return {
        id: item.id,
        ...decrypted,
      };
    });

    return NextResponse.json({ data: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
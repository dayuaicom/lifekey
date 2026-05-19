import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: users } = await supabase.from("user_heartbeat").select("*");

    if (!users) {
      return NextResponse.json({ success: true, triggered: 0 });
    }

    let triggeredCount = 0;

    const now = new Date().getTime();

    for (const user of users) {
      const last = new Date(user.last_checkin).getTime();
      const limit = user.interval_days * 24 * 60 * 60 * 1000;

      const diff = now - last;

      if (diff > limit && user.status === "active") {
        // 标记为触发
        await supabase
          .from("user_heartbeat")
          .update({ status: "triggered" })
          .eq("user_id", user.user_id);

        // 写入触发记录
        await supabase.from("legacy_triggers").insert({
          user_id: user.user_id,
          trigger_reason: "heartbeat_timeout",
          status: "pending",
        });

        triggeredCount++;
      }
    }

    return NextResponse.json({
      success: true,
      triggered: triggeredCount,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/server/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      setEmail(session.user.email || "");
    }

    checkAuth();
  }, [router]);

  async function logout() {
    await supabaseClient.auth.signOut();

    router.replace("/auth/login");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>LifeKey Dashboard</h1>

      <p style={{ marginTop: 10 }}>
        当前用户：{email}
      </p>

      <button
        onClick={() =>
          router.push("/dashboard/assets")
        }
        style={{
          marginTop: 20,
          marginRight: 10,
        }}
      >
        我的数字遗产
      </button>

      <button
        onClick={logout}
        style={{
          marginTop: 20,
        }}
      >
        退出登录
      </button>
    </div>
  );
}

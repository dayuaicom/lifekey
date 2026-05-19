"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/server/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 监听登录状态
  useEffect(() => {
    async function checkSession() {
      const { data } =
        await supabaseClient.auth.getSession();

      // 已登录
      if (data.session) {
        router.replace("/dashboard/dashboard");
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace("/dashboard/dashboard");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function login() {
    if (!email) {
      alert("请输入邮箱");
      return;
    }

    setLoading(true);

    const { error } =
      await supabaseClient.auth.signInWithOtp({
        email,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("登录邮件已发送");
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>LifeKey 登录</h2>

      <input
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: 300,
          padding: 10,
          marginBottom: 10,
          display: "block",
        }}
      />

      <button
        onClick={login}
        disabled={loading}
      >
        {loading ? "发送中..." : "发送登录链接"}
      </button>
    </div>
  );
}
"use client";

import { useState } from "react";
import { supabaseClient } from "@/server/supabase/client";
import { useRouter } from "next/navigation";
import { encryptText } from "@/server/security/crypto";

export default function NewAssetPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function createAsset() {
    if (!title || !content || !password) {
      alert("请填写完整");
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const encrypted = await encryptText(
      content,
      password
    );

    const { error } = await supabaseClient
      .from("legacy_assets")
      .insert({
        user_id: session.user.id,

        title,

        encrypted_data: encrypted.data,

        iv: encrypted.iv,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/assets");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>新建数字遗产</h1>

      <input
        placeholder="标题"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        style={{
          width: 400,
          padding: 10,
          marginTop: 20,
          display: "block",
        }}
      />

      <textarea
        placeholder="遗产内容"
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        style={{
          width: 400,
          height: 200,
          padding: 10,
          marginTop: 20,
          display: "block",
        }}
      />

      <input
        type="password"
        placeholder="解密密码"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          width: 400,
          padding: 10,
          marginTop: 20,
          display: "block",
        }}
      />

      <button
        onClick={createAsset}
        disabled={loading}
        style={{
          marginTop: 20,
        }}
      >
        {loading ? "保存中..." : "加密保存"}
      </button>
    </div>
  );
}
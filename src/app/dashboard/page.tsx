"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [interval, setInterval] = useState(7);

  // 安全 userId
  const userId = user?.id;

  // 获取用户
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  // 获取数据
  const fetchData = async (uid: string) => {
    const res = await fetch("/api/legacy/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: uid }),
    });

    const json = await res.json();
    setItems(json.data || []);
  };

  useEffect(() => {
    if (userId) fetchData(userId);
  }, [userId]);

  // 创建遗产数据
  const handleCreate = async () => {
    if (!userId) return;

    await fetch("/api/legacy/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title,
        content,
      }),
    });

    setTitle("");
    setContent("");
    fetchData(userId);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>数字遗产系统</h2>

      {/* 输入区 */}
      <input
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />

      <textarea
        placeholder="内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br />

      <button onClick={handleCreate}>保存</button>

      <hr />

      {/* 心跳系统 */}
      <h3>生命心跳设置</h3>

      <input
        type="number"
        value={interval}
        onChange={(e) => setInterval(Number(e.target.value))}
      />

      <button
        onClick={async () => {
          if (!userId) return;

          await fetch("/api/heartbeat/set", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              interval_days: interval,
            }),
          });
        }}
      >
        保存心跳周期
      </button>

      <button
        onClick={async () => {
          if (!userId) return;

          await fetch("/api/heartbeat/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
            }),
          });
        }}
      >
        立即签到
      </button>

      <hr />

      {/* 数据列表 */}
      <h3>数据列表</h3>

      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <div>标题：{item.title}</div>
          <div>内容：{item.content}</div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/server/supabase/client";
import { useRouter } from "next/navigation";
import { decryptText } from "@/server/security/crypto";

type Asset = {
  id: string;
  title: string;
  encrypted_data: number[];
  iv: number[];
};

export default function AssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [passwords, setPasswords] = useState<{
    [key: string]: string;
  }>({});

  const [decrypted, setDecrypted] = useState<{
    [key: string]: string;
  }>({});

  async function loadAssets() {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const { data, error } = await supabaseClient
      .from("legacy_assets")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setAssets(data || []);
    setLoading(false);
  }

  async function decryptAsset(asset: Asset) {
    try {
      const text = await decryptText(
        asset.encrypted_data,
        asset.iv,
        passwords[asset.id]
      );

      setDecrypted((prev) => ({
        ...prev,
        [asset.id]: text,
      }));
    } catch {
      alert("密码错误");
    }
  }

  async function deleteAsset(id: string) {
    const confirmed = confirm("确认删除？");

    if (!confirmed) return;

    const { error } = await supabaseClient
      .from("legacy_assets")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAssets();
  }

  useEffect(() => {
    loadAssets();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>我的数字遗产</h1>

      <button
        onClick={() =>
          router.push("/dashboard/assets/new")
        }
        style={{
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        新建资产
      </button>

      {assets.map((asset) => (
        <div
          key={asset.id}
          style={{
            border: "1px solid #333",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <h3>{asset.title}</h3>

          {!decrypted[asset.id] ? (
            <>
              <input
                type="password"
                placeholder="输入解密密码"
                value={
                  passwords[asset.id] || ""
                }
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    [asset.id]:
                      e.target.value,
                  }))
                }
                style={{
                  width: 300,
                  padding: 10,
                  marginTop: 10,
                  display: "block",
                }}
              />

              <button
                onClick={() =>
                  decryptAsset(asset)
                }
                style={{
                  marginTop: 10,
                }}
              >
                解密查看
              </button>
            </>
          ) : (
            <p
              style={{
                marginTop: 15,
                whiteSpace: "pre-wrap",
              }}
            >
              {decrypted[asset.id]}
            </p>
          )}

          <button
            onClick={() =>
              deleteAsset(asset.id)
            }
            style={{
              marginTop: 15,
            }}
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
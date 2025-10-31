"use client";
import React, { useEffect, useState } from "react";
import { checkHealth } from "@/services/health";

export default function TestPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    checkHealth()
      .then((res) => setData(res))
      .catch((err) => console.error("API error:", err));
  }, []);

  if (!data) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Kết quả API /health</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


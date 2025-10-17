"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase-client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function UploadImage({
  pathPrefix = "uploads",
  onUploaded,
  accept = "image/*",
}: {
  pathPrefix?: string;               // thư mục trong bucket
  onUploaded?: (url: string) => void; // callback nhận URL sau khi upload xong
  accept?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Vui lòng chọn file ảnh.");
      return;
    }

    const path = `${pathPrefix}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      },
      (e) => {
        console.error(e);
        setErr("Upload thất bại, thử lại.");
      },
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        setUrl(downloadURL);
        onUploaded?.(downloadURL);
      }
    );
  };

  return (
    <div className="space-y-3">
      <input type="file" accept={accept} onChange={handleChange} />
      {progress > 0 && progress < 100 && (
        <div className="text-sm text-gray-600">Đang tải: {progress}%</div>
      )}
      {err && <div className="text-sm text-red-500">{err}</div>}
      {url && (
        <div className="space-y-2">
          <div className="text-sm text-green-600">Upload xong!</div>
          <a href={url} target="_blank" className="text-brand-500 underline">
            Mở ảnh
          </a>
          <img src={url} alt="uploaded" className="max-w-xs rounded" />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UploadImage from "@/components/common/UploadImage";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BlogCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: gọi API thật để lưu
    console.log({ title, status, content, coverUrl });
    router.push("/blog");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Blog / Create Post" />
      <div className="space-y-6">
        <ComponentCard title="Create Post">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                placeholder="Post title..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* Cover image (Firebase Upload) */}
            <div>
  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
    Cover image
  </label>

  {/* Nút chọn file */}
  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
    📁 Chọn tệp
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCoverUrl(url);
      }}
      className="hidden"
    />
  </label>

  {/* Cách dòng hiển thị tên file ra 1 chút */}
  {coverUrl && (
    <div className="mt-3">
      <Image
        src={coverUrl}
        alt="cover"
        width={560}
        height={320}
        className="rounded border border-gray-200 object-cover dark:border-gray-800"
      />
      <p className="mt-2 break-all text-xs text-gray-500">URL: {coverUrl}</p>
    </div>
  )}
</div>
  

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                placeholder="Write something..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
                disabled={!title || !content}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => router.push("/blog")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { httpPost } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";

export default function BlogCreatePage() {
  const router = useRouter();

  // form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // firebase preview (giữ nguyên – khi tích hợp thật chỉ cần set URL public)
  const [coverUrl, setCoverUrl] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      // ✅ GỬI ĐÚNG ĐỊNH DẠNG BACKEND YÊU CẦU
      const payload = {
        title,
        content,
        category,
        language,
        isPublished,
        // Nếu BE sau này hỗ trợ ảnh bìa, thêm key tại đây, ví dụ:
        // coverUrl,
      };

      await httpPost(API_PATHS.adminCreateArticle, payload);

      router.push("/blog");
    } catch (e: any) {
      const msg = e?.body?.message || e?.message || "Không thể tạo bài viết.";
      setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Blog / Create Post" />
      <div className="space-y-6">
        <ComponentCard title="Create Post">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Error */}
            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {err}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                placeholder="Post title..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                placeholder="e.g. health, lifestyle…"
              />
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
            </div>

            {/* Publish toggle -> map sang isPublished:boolean */}
            <div className="flex items-center gap-3">
              <input
                id="publish-toggle"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label
                htmlFor="publish-toggle"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Publish immediately
              </label>
            </div>

            {/* Cover image (Firebase upload – giữ nguyên preview) */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
                Cover image
              </label>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                📁 Chọn tệp
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // TODO: upload Firebase tại đây, rồi setCoverUrl(URL_public)
                    const url = URL.createObjectURL(file);
                    setCoverUrl(url); // preview tạm
                  }}
                  className="hidden"
                />
              </label>

              {coverUrl && (
                <div className="mt-3">
                  <Image
                    src={coverUrl}
                    alt="cover"
                    width={560}
                    height={320}
                    className="rounded border border-gray-200 object-cover dark:border-gray-800"
                  />
                  <p className="mt-2 break-all text-xs text-gray-500">
                    Preview URL: {coverUrl}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
                Content
              </label>
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
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-60"
                disabled={!title || !content || !category || saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/blog")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                disabled={saving}
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

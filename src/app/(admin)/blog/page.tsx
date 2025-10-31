"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Image from "next/image";
import Link from "next/link";
import { httpGet } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";

type PostRow = {
  id: number | string;
  title: string;
  author: string;
  createdAt: string;
  status: "Draft" | "Published";
  coverUrl?: string;
};

export default function BlogListPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Chuẩn hoá 1 item từ BE => shape FE
  const normalizeItem = (raw: any, idx: number): PostRow => {
    const id = raw.ArticleID ?? raw.id ?? `art-${idx}`;
    const title = raw.Title ?? raw.title ?? "";
    const author =
      raw.AuthorName ?? raw.Author ?? raw.author ?? "—";
    const createdISO =
      raw.CreatedAt ?? raw.createdAt ?? raw.created ?? null;
    const createdAt = createdISO
      ? new Date(createdISO).toLocaleDateString("vi-VN")
      : "—";
    const status: "Draft" | "Published" =
      (raw.IsPublished === 1 || raw.isPublished === true) ? "Published" : "Draft";
    const coverUrl = raw.CoverUrl ?? raw.coverUrl ?? raw.ImageUrl ?? raw.imageUrl ?? "";

    return { id, title, author, createdAt, status, coverUrl };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // GET /api/admin/articles
        const res = await httpGet<any>(API_PATHS.adminArticles);
        const list = (res?.data ?? res ?? []) as any[];
        const rows = Array.isArray(list)
          ? list.map((it, i) => normalizeItem(it, i))
          : [];

        setPosts(rows);
      } catch (e: any) {
        const msg = e?.body?.message || e?.message || "Không tải được danh sách bài viết.";
        setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Blog / All Posts" />

      <div className="space-y-6">
        <ComponentCard
          title="All Posts"
          rightArea={
            <Link
              href="/blog/create"
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600"
            >
              + Create Post
            </Link>
          }
        >
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : err ? (
              <div className="p-6 text-center text-red-500">{err}</div>
            ) : (
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800">
                    <th className="px-4 py-3 text-sm">ID</th>
                    <th className="px-4 py-3 text-sm">Cover</th>
                    <th className="px-4 py-3 text-sm">Title</th>
                    <th className="px-4 py-3 text-sm">Author</th>
                    <th className="px-4 py-3 text-sm">Created</th>
                    <th className="px-4 py-3 text-sm">Status</th>
                    <th className="px-4 py-3 text-sm">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.length > 0 ? (
                    posts.map((p) => (
                      <tr
                        key={String(p.id)}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="px-4 py-3 align-middle">{p.id}</td>

                        <td className="px-4 py-3 align-middle">
                          {p.coverUrl ? (
                            <Image
                              src={p.coverUrl}
                              alt={p.title || "cover"}
                              width={64}
                              height={40}
                              className="rounded object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                            />
                          ) : (
                            <div className="h-10 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                          )}
                        </td>

                        <td className="px-4 py-3 align-middle">
                          {p.title ? (
                            <Link href={`/blog/${p.id}`} className="hover:underline">
                              {p.title}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-3 align-middle">{p.author || "—"}</td>
                        <td className="px-4 py-3 align-middle">{p.createdAt || "—"}</td>

                        <td className="px-4 py-3 align-middle">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              p.status === "Published"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/blog/${p.id}`}
                              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                            >
                              View
                            </Link>
                            <Link
                              href={`/blog/${p.id}/edit`}
                              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No posts yet.{" "}
                        <Link className="text-brand-500 hover:underline" href="/blog/create">
                          Create one
                        </Link>
                        .
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

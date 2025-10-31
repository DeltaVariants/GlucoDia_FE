"use client";

import React from "react";

type U = { id?: string | number; name: string; role?: string; at?: string; href?: string };
type P = { id?: string | number; title: string; at?: string; href?: string };

export default function RecentItems({
  users = [],
  posts = [],
}: {
  users?: U[];
  posts?: P[];
}) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Recent Users */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">Người dùng gần đây</div>
        <ul className="space-y-2">
          {users?.length ? (
            users.map((u, idx) => (
              <li
                key={`user-${u?.id ?? "na"}-${idx}`} // ✅ đảm bảo duy nhất kể cả SSR
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">
                    {u.role || "—"} • {u.at || ""}
                  </div>
                </div>
                {u.href && (
                  <a
                    href={u.href}
                    className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Xem
                  </a>
                )}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">Chưa có dữ liệu</li>
          )}
        </ul>
      </div>

      {/* Recent Posts */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">Bài viết gần đây</div>
        <ul className="space-y-2">
          {posts?.length ? (
            posts.map((p, idx) => (
              <li
                key={`post-${p?.id ?? "na"}-${idx}`} // ✅ đảm bảo duy nhất kể cả SSR
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.at || ""}</div>
                </div>
                {p.href && (
                  <a
                    href={p.href}
                    className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Xem
                  </a>
                )}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">Chưa có dữ liệu</li>
          )}
        </ul>
      </div>
    </section>
  );
}

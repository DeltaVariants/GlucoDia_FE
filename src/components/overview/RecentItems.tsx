"use client";
import React from "react";
import Link from "next/link";

export default function RecentItems({
  users, posts,
}: {
  users: { id: string; name: string; role: "Doctor"|"Patient"; at: string; href: string }[];
  posts: { id: string; title: string; at: string; href: string }[];
}) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card title="User mới">
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.role} • {u.at}</div>
              </div>
              <Link href={u.href} className="text-sm text-brand-500 hover:underline">Xem</Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Bài viết mới">
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{p.title}</div>
                <div className="text-xs text-gray-500">{p.at}</div>
              </div>
              <Link href={p.href} className="text-sm text-brand-500 hover:underline">Xem</Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function Card({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm">
      <div className="mb-3 font-medium">{title}</div>
      {children}
    </div>
  );
}

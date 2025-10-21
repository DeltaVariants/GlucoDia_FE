"use client";
import React from "react";

export default function OverviewCards({
  doctors,
  patients,
  posts,
  revenue,
}: {
  doctors: number;
  patients: number;
  posts: number;
  revenue: number;
}) {
  const items = [
    { label: "Bác sĩ", value: doctors },
    { label: "Bệnh nhân", value: patients },
    { label: "Bài viết", value: posts },
    { label: "Doanh thu (VND)", value: revenue.toLocaleString() },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-950 shadow-sm transition-colors hover:shadow-md"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {it.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {it.value}
          </div>
        </div>
      ))}
    </section>
  );
}

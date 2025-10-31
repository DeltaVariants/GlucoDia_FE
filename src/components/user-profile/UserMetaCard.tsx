"use client";

type Me = {
  fullName?: string;
  email?: string;
  type?: "patient" | "doctor";
  createdAt?: string;
};

function formatDate(d?: string) {
  try {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return d || "—";
  }
}

export default function UserMetaCard({ user }: { user: Me | null }) {
  const initials =
    (user?.fullName || user?.email || "?")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-white/80 font-semibold">
          {initials}
        </div>

        <div className="min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-white/90 truncate">
            {user?.fullName || "—"}
          </h4>

          <p className="text-sm text-gray-500 truncate">{user?.email || "—"}</p>

          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-600 dark:text-white/80 dark:border-gray-700">
              {user?.type ?? "—"}
            </span>
            <span className="text-xs text-gray-400">
              Created: {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

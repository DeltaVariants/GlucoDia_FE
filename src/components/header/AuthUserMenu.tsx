"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

function getInitials(name?: string, email?: string) {
  const src = (name || email || "").trim();
  if (!src) return "U";
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "U";
}

export default function AuthUserMenu() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // click outside để đóng menu
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Loading state
  if (loading) {
    return <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />;
  }

  // Chưa đăng nhập → nút Sign in
  if (!user) {
    return (
      <Link
        href="/signin"
        className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-sm"
      >
        Đăng nhập
      </Link>
    );
  }

  // Đã đăng nhập → avatar + tên + menu
  const displayName = (user as any).fullName || (user as any).name || user.email || "User";
  const email = user.email;
  const role = (user as any).role;
  const avatarUrl = (user as any).avatarUrl || (user as any).avatar;

  return (
    <div className="relative" ref={ref}>
      {/* Nút trigger: avatar + tên + chevron */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-3 rounded-lg border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white grid place-items-center text-xs">
            {getInitials(displayName, email)}
          </div>
        )}

        {/* Tên + role (ẩn trên mobile) */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm text-gray-800 dark:text-gray-100 max-w-[160px] truncate">
            {displayName}
          </span>
          {role && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {role}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`ml-1 h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.148l3.71-3.917a.75.75 0 111.08 1.04l-4.24 4.48a.75.75 0 01-1.08 0l-4.24-4.48a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-[1000]"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gray-900 text-white grid place-items-center text-xs">
                {getInitials(displayName, email)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {email}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />

          <Link
  href="/profile"
  className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
  role="menuitem"
  onClick={() => setOpen(false)}
>
  Hồ sơ cá nhân
</Link>


          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Cài đặt
          </Link>

          <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />

          <button
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            role="menuitem"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
// import UserDropdown from "@/components/header/UserDropdown";
import AuthUserMenu from "@/components/header/AuthUserMenu";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };
  const toggleApplicationMenu = () => setApplicationMenuOpen((s) => !s);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Toggle sidebar */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              // close icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.281a.75.75 0 0 1 1.06-1.06L12 10.94l4.718-4.718a.75.75 0 1 1 1.06 1.06L13.06 12l4.718 4.719a.75.75 0 1 1-1.06 1.06L12 13.06l-4.719 4.718a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.281Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // menu icon
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.583 1A.75.75 0 0 1 1.333.25h13.333a.75.75 0 1 1 0 1.5H1.333A.75.75 0 0 1 .583 1ZM.583 11a.75.75 0 0 1 .75-.75h13.333a.75.75 0 1 1 0 1.5H1.333A.75.75 0 0 1 .583 11ZM1.333 5.25a.75.75 0 0 0 0 1.5h6.667a.75.75 0 1 0 0-1.5H1.333Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo nhỏ */}
          <Link href="/" className="lg:hidden">
            <Image width={154} height={32} className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" />
            <Image width={154} height={32} className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" />
          </Link>

          {/* Nút app menu (mobile) */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.495a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4.5 1.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Search (desktop) */}
          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.042 9.374a6.333 6.333 0 1 1 11.5 3.96l2.82 2.82a.75.75 0 1 1-1.06 1.06l-2.82-2.82a6.333 6.333 0 0 1-10.44-5.02Zm6.333-5.333a5.333 5.333 0 1 0 0 10.666 5.333 5.333 0 0 0 0-10.666Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                />
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span> ⌘ </span><span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Khu vực action bên phải */}
        <div className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}>
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          {/* User area: hiển thị avatar + tên + menu xổ xuống */}
          <AuthUserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

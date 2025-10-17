import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {/* ==== Cột bên trái: form đăng nhập ==== */}
          {children}

          {/* ==== Cột bên phải: logo SVG fill toàn khung ==== */}
          <div className="lg:w-1/2 w-full h-full relative hidden lg:block">
            <Image
              src="/images/icons/artboard-1-copy.svg" // ✅ Đúng đường dẫn thực tế
              alt="Auth Background Logo"
              fill
              className="object-contain bg-white dark:bg-gray-900"
              priority
            />

            {/* Overlay nhẹ (có thể bỏ nếu không cần) */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/50" />
          </div>

          {/* ==== Nút đổi theme ==== */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}

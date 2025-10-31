"use client";

import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

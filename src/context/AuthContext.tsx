// src/context/AuthContext.tsx (Code sau khi sửa)
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// Giả định bạn đã sửa đổi file http.ts để hàm login trả về User (như tôi đã đề xuất trước đó)
// Nếu bạn chưa sửa, hãy giữ nguyên type Ctx và hàm login như ban đầu (trả về Promise<void>)
import { httpGet, httpPost } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";

type UserType = "patient" | "doctor" | "admin";

// Giữ nguyên các định nghĩa Type
type User = {
  id: string;
  email?: string;
  fullName?: string;
  role?: UserType;
} | null;

type LoginArgs = {
  email: string;
  password: string;
  userType: UserType;
  keepLoggedIn?: boolean;
};

// Tôi giữ nguyên type Ctx cũ (login trả về void) như trong code gốc của bạn
type Ctx = {
  user: User;
  loading: boolean;
  login: (args: LoginArgs) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Load user nếu có token (Giữ nguyên)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    httpGet<any>(API_PATHS.me)
      .then((res) => setUser(res?.user ?? res?.data ?? res ?? null))
      .catch(() => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Logic hàm login (Đã sửa)
  async function login({ email, password, userType, keepLoggedIn }: LoginArgs) {
    setLoading(true);
    try {
      // SỬA: Bỏ logic riêng cho API_PATHS.loginAdmin 
      // Giả định tất cả user type (bao gồm Admin) dùng chung API_PATHS.login
      // và khác biệt được xử lý trong body request (qua userType) hoặc ở server.
      // const loginUrl = userType === "admin" ? API_PATHS.loginAdmin ?? API_PATHS.login : API_PATHS.login;
      const loginUrl = API_PATHS.login; // 👈 Dùng chung login URL

      const res = await httpPost<any>(loginUrl, {
        email: email.trim().toLowerCase(),
        password,
        userType, // Quan trọng: Vẫn truyền userType lên server
      });

      const token =
        res?.token ??
        res?.accessToken ??
        res?.data?.token ??
        res?.data?.accessToken ??
        null;

      if (!token) throw new Error("Không nhận được token từ API.");

      // Lưu token (Giữ nguyên)
      if (keepLoggedIn) {
        localStorage.setItem("token", token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
      }

      // Lấy thông tin user (Giữ nguyên)
      const me = await httpGet<any>(API_PATHS.me);
      setUser(me?.user ?? me?.data ?? me ?? null);
    } catch (err) {
      console.error("Login failed:", err);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      throw err; 
    } finally {
      setLoading(false);
    }
  }

  // Hàm logout (Giữ nguyên)
  async function logout() {
    setLoading(true);
    try {
      await httpPost<any>(API_PATHS.logout, {});
    } catch {
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  }

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
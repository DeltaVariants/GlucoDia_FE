import { httpPost } from "./http";

export type LoginResp = { token: string; user?: any };

export async function login(email: string, password: string) {
  // 🔁 Điền đúng endpoint login theo Swagger của bạn:
  const data = await httpPost<LoginResp>("/api/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

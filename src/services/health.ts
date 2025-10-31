import { httpGet } from "@/lib/http";

export async function checkHealth() {
  return httpGet("/health");
}

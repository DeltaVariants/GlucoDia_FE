"use client";

import React, { useEffect, useState } from "react";
import OverviewCards from "@/components/overview/OverviewCards";
import ActivitySection from "@/components/overview/ActivitySection";
import RecentItems from "@/components/overview/RecentItems";
import { httpGet } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";

type Cards = { doctors: number; patients: number; posts: number; revenue: number };
type Activity = { labels: string[]; usersAll: number[]; usersPremium: number[]; revenue: number[] };
type RecentUser = { id: string; name: string; role?: string; at?: string; href?: string };
type RecentPost = { id: string; title: string; at?: string; href?: string };

export default function AdminOverviewPage() {
  const [cards, setCards] = useState<Cards | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [
          overviewRes,
          chartUsersRes,
          chartRevenueRes,
          recentUsersRes,
          recentArticlesRes,
        ] = await Promise.all([
          httpGet<any>(API_PATHS.adminOverview),
          httpGet<any>(API_PATHS.adminChartsUsers),
          httpGet<any>(API_PATHS.adminChartsRevenue),
          httpGet<any>(API_PATHS.adminRecentUsers),
          httpGet<any>(API_PATHS.adminRecentArticles),
        ]);

        // ===== KPIs
        const ov = overviewRes?.data ?? overviewRes ?? {};
        setCards({
          doctors: Number(ov.doctors ?? ov.counters?.doctors ?? 0),
          patients: Number(ov.patients ?? ov.counters?.patients ?? 0),
          posts: Number(ov.posts ?? ov.counters?.posts ?? 0),
          revenue: Number(ov.revenue ?? ov.counters?.revenue ?? 0),
        });

        // ===== Charts
        const cu = chartUsersRes?.data ?? chartUsersRes ?? {};
        const cr = chartRevenueRes?.data ?? chartRevenueRes ?? {};
        const userLabels: string[] = cu.labels ?? cu.months ?? [];
        const usersAll: number[] = cu.all ?? cu.usersAll ?? cu.users?.all ?? [];
        const usersPremium: number[] = cu.premium ?? cu.usersPremium ?? cu.users?.premium ?? [];
        const revLabels: string[] = cr.labels ?? cr.months ?? [];
        const revenue: number[] = cr.revenue ?? cr.data ?? [];
        const labels = userLabels?.length ? userLabels : (revLabels ?? []);

        setActivity({
          labels,
          usersAll: usersAll ?? [],
          usersPremium: usersPremium ?? [],
          revenue: revenue ?? [],
        });

        // ===== Recent (tạo KEY duy nhất)
        const rUsers = (recentUsersRes?.data ?? recentUsersRes ?? []) as any[];
        const rArticles = (recentArticlesRes?.data ?? recentArticlesRes ?? []) as any[];

        const safeUsers: RecentUser[] = (Array.isArray(rUsers) ? rUsers : []).map(
          (u: any, idx: number) => {
            const rawId = u.id ?? u.userId ?? u._id ?? u.ArticleID ?? u.ArticleId;
            const id = `usr-${rawId ?? idx}`; // << key luôn unique
            const atRaw = u.at ?? u.createdAt ?? u.CreatedAt ?? "";
            const at =
              atRaw ? new Date(atRaw).toLocaleString("vi-VN") : "";
            return {
              id,
              name: u.name ?? u.fullName ?? "—",
              role: u.role ?? u.type ?? "",
              at,
              href: "/manage-user/" + (u.role?.toLowerCase() ?? "patient"),
            };
          },
        );

        const safePosts: RecentPost[] = (Array.isArray(rArticles) ? rArticles : []).map(
          (p: any, idx: number) => {
            const rawId = p.id ?? p.articleId ?? p.ArticleID ?? p._id;
            const id = `art-${rawId ?? idx}`; // << key luôn unique
            const atRaw = p.at ?? p.createdAt ?? p.CreatedAt ?? "";
            const at =
              atRaw ? new Date(atRaw).toLocaleString("vi-VN") : "";
            return {
              id,
              title: p.title ?? p.Title ?? "—",
              at,
              href: "/blog",
            };
          },
        );

        setRecentUsers(safeUsers);
        setRecentPosts(safePosts);
      } catch (e: any) {
        const msg = e?.body?.message || e?.message || "Không tải được dữ liệu tổng quan.";
        setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Đang tải dữ liệu…</div>;
  if (err) return <div className="p-6 text-red-500">{err}</div>;
  if (!cards || !activity) return null;

  return (
    <div className="p-6 space-y-6">
      <OverviewCards
        doctors={cards.doctors}
        patients={cards.patients}
        posts={cards.posts}
        revenue={cards.revenue}
      />

      <ActivitySection
        labels={activity.labels}
        usersAll={activity.usersAll}
        usersPremium={activity.usersPremium}
        revenue={activity.revenue}
      />

      {(recentUsers.length > 0 || recentPosts.length > 0) && (
        <RecentItems users={recentUsers} posts={recentPosts} />
      )}
    </div>
  );
}

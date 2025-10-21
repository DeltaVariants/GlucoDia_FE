"use client";
import React from "react";
import OverviewCards from "@/components/overview/OverviewCards";
import ActivitySection from "@/components/overview/ActivitySection";
import RecentItems from "@/components/overview/RecentItems";

export default function AdminOverviewPage() {
  // ❗ demo data – thay bằng API thật khi có
  const kpis = {
    doctors: 42,
    patients: 1280,
    posts: 67,
    revenue: 124_500_000, // VND
  };

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const usersAll   = [120,180,160,200,220,240,260,210,190,230,250,270];
  const usersPrem  = [ 20, 25, 30, 35, 40, 42, 45, 40, 38, 44, 50, 55];
  const revenueM   = [168,385,201,298,187,195,291,110,215,390,280,112];

  const recentUsers = [
    { id: "u-101", name: "Dr. Nguyen", role: "Doctor",  at: "2 giờ trước", href: "/manage-user/doctor" },
    { id: "u-102", name: "Tran A",     role: "Patient", at: "4 giờ trước", href: "/manage-user/patient" },
  ];
  const recentPosts = [
    { id: "p-501", title: "Cách theo dõi đường huyết hiệu quả", at: "Hôm qua", href: "/blog" },
    { id: "p-502", title: "Chế độ ăn cho người tiểu đường",     at: "2 ngày trước", href: "/blog" },
  ];

  return (
    <div className="p-6 space-y-6">
      <OverviewCards {...kpis} />

      <ActivitySection
        labels={monthLabels}
        usersAll={usersAll}
        usersPremium={usersPrem}
        revenue={revenueM}
      />

      <RecentItems users={recentUsers} posts={recentPosts} />
    </div>
  );
}

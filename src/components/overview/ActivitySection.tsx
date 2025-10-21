"use client";
import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ActivitySection({
  labels, usersAll, usersPremium, revenue,
}: {
  labels: string[];
  usersAll: number[];
  usersPremium: number[];
  revenue: number[];
}) {
  const lineOpts: ApexOptions = {
    chart: { type: "line", height: 300, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#465FFF", "#9CB9FF"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show:false }, axisTicks: { show:false } },
    grid: { yaxis: { lines: { show: true } } },
    legend: { show: true, position: "top", horizontalAlign: "left" },
  };

  const barOpts: ApexOptions = {
    chart: { type: "bar", height: 240, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 6, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show:false }, axisTicks: { show:false } },
    grid: { yaxis: { lines: { show: true } } },
    colors: ["#465FFF"],
    legend: { show: false },
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">Người dùng / Premium (12 tháng)</div>
        <ReactApexChart
          options={lineOpts}
          series={[
            { name: "Users", data: usersAll },
            { name: "Premium", data: usersPremium },
          ]}
          type="area"
          height={300}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">Doanh thu (12 tháng)</div>
        <ReactApexChart
          options={barOpts}
          series={[{ name: "Revenue", data: revenue }]}
          type="bar"
          height={240}
        />
      </div>
    </section>
  );
}

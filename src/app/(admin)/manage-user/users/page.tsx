"use client";
import React from "react";
import PatientTable from "@/components/tables/PatientTable";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white/90">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Danh sách người dùng (bệnh nhân) – xem & (nếu là admin) chỉnh sửa.
        </p>
      </div>

      <PatientTable />
    </div>
  );
}

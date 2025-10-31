"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { httpGet } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

type Row = {
  id: number | string;
  avatar: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit: string;
  isPremium: boolean;
};

const DEFAULT_AVATAR = "/images/user/user-25.jpg";

export default function PatientTable() {
  const { user, loading: authLoading } = useAuth(); // lấy role user
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Chọn endpoint theo vai trò đăng nhập
  function resolvePatientsEndpoint(): string {
    const role = (user?.role || "").toLowerCase();

    if (role === "admin") {
      // Ưu tiên endpoint admin; nếu BE chưa có, fallback query all
      return (API_PATHS as any).adminPatients || `${API_PATHS.patients}?all=1`;
    }

    if (role === "doctor") {
      // Theo swagger: danh sách bệnh nhân của bác sĩ
      return API_PATHS.myPatients || API_PATHS.patients;
    }

    // patient / guest: dùng chung
    return API_PATHS.patients;
  }

  useEffect(() => {
    // chờ AuthContext load xong để biết role, tránh gọi sai endpoint
    if (authLoading) return;

    (async () => {
      setErr("");
      setLoading(true);
      try {
        const url = resolvePatientsEndpoint();
        const res = await httpGet<any>(url);

        // BE có thể trả {success, data} hoặc mảng thẳng
        const list: any[] = Array.isArray(res) ? res : (res?.data ?? []);

        const mapped: Row[] = list.map((p: any, idx: number) => {
          const id = p.id ?? p.patientId ?? idx + 1;

          const name =
            p.fullName ??
            p.name ??
            (([p.firstName, p.lastName].filter(Boolean).join(" ")) ||
              `Patient ${id}`);

          const avatar = p.avatarUrl ?? p.avatar ?? p.photo ?? DEFAULT_AVATAR;
          const dob = p.dateOfBirth ?? p.dob ?? "";
          const phone = p.phone ?? p.phoneNumber ?? "";
          const lastVisit =
            p.lastVisit ?? p.lastCheckin ?? p.updatedAt ?? p.createdAt ?? "";
          const isPremium = Boolean(
            p.isPremium ?? p.premium ?? (p.membership === "premium")
          );

          return { id, name, avatar, dob, phone, lastVisit, isPremium };
        });

        setRows(mapped);
      } catch (e: any) {
        const msg =
          e?.body?.message || e?.message || "Không thể tải danh sách bệnh nhân.";
        setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.role]);

  const content = useMemo(() => {
    if (authLoading || loading) {
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
            Đang tải danh sách…
          </TableCell>
        </TableRow>
      );
    }
    if (err) {
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-red-500">{err}</TableCell>
        </TableRow>
      );
    }
    if (!rows.length) {
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
            Chưa có bệnh nhân nào.
          </TableCell>
        </TableRow>
      );
    }
    return rows.map((p) => (
      <TableRow key={p.id}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image src={p.avatar} alt={p.name} width={40} height={40} />
            </div>
            <div>
              <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {p.name}
              </span>
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                ID: {p.id}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {p.dob || "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {p.phone || "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {p.lastVisit || "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm">
          {p.isPremium ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Premium
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Free
            </span>
          )}
        </TableCell>
      </TableRow>
    ));
  }, [rows, loading, authLoading, err]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Patient
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  DOB
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Last Visit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Membership
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {content}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// src/components/tables/DoctorTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { httpGet, httpPut } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";

type Row = {
  id: number | string;
  avatar: string;
  name: string;
  specialty: string;
  phone: string;
  status: "Active" | "Inactive";
};

const DEFAULT_AVATAR = "/images/user/user-25.jpg";
const DEBUG = false;

/** Lấy thuộc tính hỗ trợ: dot-path, case-insensitive, snake/camel/pascal */
function getProp(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur: any = obj;

  for (const raw of parts) {
    if (cur == null) return undefined;

    // tìm key đúng, không đúng thì thử case-insensitive
    let key = Object.prototype.hasOwnProperty.call(cur, raw)
      ? raw
      : Object.keys(cur).find((k) => k.toLowerCase() === raw.toLowerCase());

    if (!key) {
      // thử thêm các biến thể snake/camel/pascal
      const variants = [
        raw,
        raw.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()), // fullName -> full_name
        raw.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), // full_name -> fullName
        raw[0].toUpperCase() + raw.slice(1), // fullName -> FullName
        raw.toLowerCase(),
      ];
      key = Object.keys(cur).find((k) =>
        variants.some((v) => v.toLowerCase() === k.toLowerCase())
      );
    }

    if (!key) return undefined;
    cur = cur[key];
  }
  return cur;
}

function pick(obj: any, candidates: string[]): any {
  for (const c of candidates) {
    const v = getProp(obj, c);
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

export default function DoctorTable() {
  const { user } = useAuth();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    phone: "",
    isActive: true as boolean,
  });
  const [feedback, setFeedback] = useState("");

  function openEditModal(row: Row) {
    setEditId(row.id);
    setForm({
      fullName: row.name || "",
      specialization: row.specialty !== "—" ? row.specialty : "",
      phone: row.phone !== "—" ? row.phone : "",
      isActive: row.status === "Active",
    });
    setFeedback("");
    setOpen(true);
  }

  async function saveDoctor() {
    if (editId == null) return;
    setSaving(true);
    setFeedback("");
    try {
      // payload tối thiểu theo swagger /api/doctors/{id}
      const payload: any = {
        fullName: form.fullName?.trim(),
        specialization: form.specialization?.trim(),
        phone: form.phone?.trim(),
        isActive: !!form.isActive,
      };

      // bỏ key rỗng
      Object.keys(payload).forEach((k) => {
        const v = (payload as any)[k];
        if (v === "" || v === undefined) delete (payload as any)[k];
      });

      await httpPut(API_PATHS.doctorById(editId), payload);

      // cập nhật lại hàng trong bảng
      setRows((prev) =>
        prev.map((r) =>
          r.id === editId
            ? {
                ...r,
                name: payload.fullName ?? r.name,
                specialty: payload.specialization ?? r.specialty,
                phone: payload.phone ?? r.phone,
                status: (payload.isActive ?? (r.status === "Active"))
                  ? "Active"
                  : "Inactive",
              }
            : r
        )
      );

      setOpen(false);
    } catch (e: any) {
      const msg =
        e?.body?.message || e?.message || "Cập nhật bác sĩ thất bại.";
      setFeedback(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await httpGet<any>(API_PATHS.doctors);
        const list: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : [];

        if (DEBUG) {
          console.log("[doctors] raw:", list.slice(0, 2));
        }

        const mapped: Row[] = list.map((d: any, idx: number) => {
          const id =
            pick(d, ["id", "doctorId", "userId", "Id", "DoctorId"]) ?? idx + 1;

          const avatar =
            (pick(d, [
              "avatarUrl",
              "avatar",
              "photo",
              "image",
              "user.avatarUrl",
              "user.photo",
              "profile.avatar",
              "Profile.Avatar",
            ]) as string) || DEFAULT_AVATAR;

          let name =
            (pick(d, [
              "fullName",
              "FullName",
              "name",
              "Name",
              "doctorName",
              "DoctorName",
              "user.fullName",
              "user.name",
              "profile.fullName",
              "firstName",
              "FirstName",
            ]) as string) || "";

          if (!name) {
            const first =
              (pick(d, [
                "firstName",
                "FirstName",
                "user.firstName",
                "profile.firstName",
              ]) as string) || "";
            const last =
              (pick(d, [
                "lastName",
                "LastName",
                "user.lastName",
                "profile.lastName",
              ]) as string) || "";
            if (first || last) name = `${first} ${last}`.trim();
          }
          if (!name) {
            const email =
              (pick(d, ["email", "Email", "user.email"]) as string) || "";
            name = email ? email.split("@")[0] : `Doctor ${id}`;
          }

          const specialty =
            (pick(d, [
              "specialization",
              "Specialization",
              "speciality",
              "Speciality",
              "specialty",
              "Specialty",
              "profile.specialization",
            ]) as string) || "—";

          const phone =
            (pick(d, ["phone", "Phone", "phoneNumber", "user.phone"]) as string) ||
            "—";

          const activeRaw = pick(d, ["isActive", "active", "status", "Status"]);
          const status: "Active" | "Inactive" =
            activeRaw === true ||
            String(activeRaw).toLowerCase() === "active" ||
            activeRaw === 1
              ? "Active"
              : "Inactive";

          return { id, avatar, name, specialty, phone, status };
        });

        setRows(mapped);
      } catch (e: any) {
        const msg =
          e?.body?.message || e?.message || "Không thể tải danh sách bác sĩ.";
        setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const body = useMemo(() => {
    if (loading)
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-gray-500">
            Đang tải danh sách…
          </TableCell>
        </TableRow>
      );

    if (err)
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-red-500">{err}</TableCell>
        </TableRow>
      );

    if (!rows.length)
      return (
        <TableRow>
          <TableCell className="px-5 py-6 text-sm text-gray-500">
            Chưa có bác sĩ nào.
          </TableCell>
        </TableRow>
      );

    return rows.map((d) => (
      <TableRow key={d.id}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src={d.avatar} alt={d.name} width={40} height={40} />
            </div>
            <div>
              <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {d.name}
              </span>
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                ID: {d.id}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {d.specialty}
        </TableCell>
        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {d.phone}
        </TableCell>
        <TableCell className="px-4 py-3">
          <Badge size="sm" color={d.status === "Active" ? "success" : "warning"}>
            {d.status}
          </Badge>
        </TableCell>

        {/* Actions chỉ dành cho Admin */}
        {isAdmin && (
          <TableCell className="px-4 py-3 text-right">
            <button
              onClick={() => openEditModal(d)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              View / Edit
            </button>
          </TableCell>
        )}
      </TableRow>
    ));
  }, [rows, loading, err, isAdmin]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Doctor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Specialty
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                {isAdmin && (
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {body}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Modal Edit (Admin only) === */}
      {open && isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Doctor Information
              </h3>
              <button
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                  Full name
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                  Specialty
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, specialization: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                  Phone
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Active
                </label>
              </div>

              {feedback && (
                <p className="text-sm text-red-500 -mt-2">{feedback}</p>
              )}

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                  onClick={saveDoctor}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

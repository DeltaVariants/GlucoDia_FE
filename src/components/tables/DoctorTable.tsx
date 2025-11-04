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

/** ===== Types ===== */
type Row = {
  /** ID gốc dùng để gọi API và hiển thị */
  id: number | string;
  /** Key duy nhất cho React, không ảnh hưởng id gốc */
  rowKey: string;
  avatar: string;
  name: string;
  specialty: string;
  phone: string;
  status: "Active" | "Inactive";
};

type DoctorDetail = {
  id?: number | string;
  fullName?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  hospital?: string;
  isActive?: boolean | number | "Active" | "Inactive" | "1" | "0";
  avatarUrl?: string;
};

const DEFAULT_AVATAR = "/images/user/user-25.jpg";

/** ===== Utils an toàn dữ liệu ===== */
function safeString(v: any, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

/** Lấy thuộc tính linh hoạt: dot-path + case-insensitive + snake/camel/pascal */
function getProp(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur: any = obj;

  for (const raw of parts) {
    if (cur == null) return undefined;

    let key = Object.prototype.hasOwnProperty.call(cur, raw)
      ? raw
      : Object.keys(cur).find((k) => k.toLowerCase() === raw.toLowerCase());

    if (!key) {
      const variants = [
        raw,
        raw.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()),
        raw.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        raw[0].toUpperCase() + raw.slice(1),
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

/** Chuẩn hoá boolean từ nhiều kiểu backend có thể trả về */
function toBool(v: any): boolean {
  if (v === true || v === 1 || v === "1") return true;
  const s = String(v ?? "").toLowerCase();
  return s === "true" || s === "active" || s === "yes";
}

/** Label + value row (dùng cho view mode) */
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-3">
      <div className="col-span-1 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="col-span-2 text-sm text-gray-800 dark:text-white/90">
        {children}
      </div>
    </div>
  );
}

/** ===== Component ===== */
export default function DoctorTable() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state (Admin)
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // <-- NEW: view trước, rồi mới edit
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [feedback, setFeedback] = useState("");

  // Form chi tiết (admin)
  const [form, setForm] = useState<Required<DoctorDetail>>({
    id: "",
    fullName: "",
    specialization: "",
    phone: "",
    email: "",
    licenseNumber: "",
    hospital: "",
    isActive: true,
    avatarUrl: "",
  });

  // Lưu snapshot gốc để khôi phục khi hủy chỉnh sửa
  const [original, setOriginal] = useState<Required<DoctorDetail> | null>(null);

  /** Mở modal -> VIEW MODE; tải chi tiết bằng API admin */
  async function openEditModal(row: Row) {
    if (!isAdmin) return;
    setEditId(row.id);
    setFeedback("");
    setOpen(true);
    setEditMode(false); // luôn mở ở view-mode

    // Seed tạm thời từ row (để UI không trống)
    const seed: Required<DoctorDetail> = {
      id: row.id,
      fullName: row.name !== "—" ? row.name : "",
      specialization: row.specialty !== "—" ? row.specialty : "",
      phone: row.phone !== "—" ? row.phone : "",
      email: "",
      licenseNumber: "",
      hospital: "",
      isActive: row.status === "Active",
      avatarUrl: row.avatar || DEFAULT_AVATAR,
    };
    setForm(seed);
    setOriginal(seed);

    // Gọi chi tiết từ admin API (ID GỐC)
    try {
      const res = await httpGet<any>(API_PATHS.adminDoctorById(row.id));
      const d: DoctorDetail = (res?.data ?? res ?? {}) as DoctorDetail;

      const populated: Required<DoctorDetail> = {
        id: (d.id ?? row.id) as string | number,
        fullName: d.fullName ?? seed.fullName,
        specialization: d.specialization ?? seed.specialization,
        phone: d.phone ?? seed.phone,
        email: d.email ?? "",
        licenseNumber: d.licenseNumber ?? "",
        hospital: d.hospital ?? "",
        isActive: toBool(d.isActive ?? seed.isActive),
        avatarUrl: d.avatarUrl ?? seed.avatarUrl,
      };

      setForm(populated);
      setOriginal(populated); // giữ bản gốc đã fetch để revert nếu cần
    } catch (e: any) {
      const msg =
        e?.body?.message || e?.message || "Không thể tải thông tin bác sĩ.";
      setFeedback(Array.isArray(msg) ? msg.join(", ") : String(msg));
    }
  }

  /** Bật edit mode */
  function startEditing() {
    setEditMode(true);
    setFeedback("");
    // form hiện tại chính là original mới nhất; user edit trên đó
  }

  /** Hủy chỉnh sửa -> quay về view + khôi phục form */
  function cancelEditing() {
    if (original) setForm(original);
    setEditMode(false);
    setFeedback("");
  }

  /** Lưu thay đổi qua admin API (chỉ khi editMode) */
  async function saveDoctor() {
    if (!isAdmin || editId == null || !editMode) return;
    setSaving(true);
    setFeedback("");

    try {
      const payload: any = {
        fullName: form.fullName?.trim(),
        specialization: form.specialization?.trim(),
        phone: form.phone?.trim(),
        email: form.email?.trim(),
        licenseNumber: form.licenseNumber?.trim(),
        hospital: form.hospital?.trim(),
        isActive: !!form.isActive,
      };

      // loại key rỗng
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === "" || v === undefined) delete payload[k];
      });

      await httpPut(API_PATHS.adminUpdateDoctor(editId), payload);

      // Cập nhật lại hàng trong bảng cho khớp UI
      setRows((prev) =>
        prev.map((r) =>
          String(r.id) === String(editId)
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

      // Sau khi lưu: cập nhật original = form mới, và quay về view-mode
      const updatedOriginal = {
        ...form,
        isActive: !!(payload.isActive ?? form.isActive),
      } as Required<DoctorDetail>;
      setOriginal(updatedOriginal);
      setForm(updatedOriginal);
      setEditMode(false);
      setFeedback("");
    } catch (e: any) {
      const msg =
        e?.body?.message || e?.message || "Cập nhật bác sĩ thất bại.";
      setFeedback(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setSaving(false);
    }
  }

  /** Tải danh sách (admin dùng adminDoctors; user thường dùng doctors) */
  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const listRes = await httpGet<any>(
          isAdmin ? API_PATHS.adminDoctors : API_PATHS.doctors
        );

        const list: any[] = Array.isArray(listRes)
          ? listRes
          : Array.isArray(listRes?.data)
          ? listRes.data
          : Array.isArray(listRes?.items)
          ? listRes.items
          : Array.isArray(listRes?.data?.items)
          ? listRes.data.items
          : [];

        const mapped: Row[] = list.map((d: any, idx: number) => {
          const rawId =
            pick(d, ["id", "doctorId", "userId", "Id", "DoctorId"]) ??
            `${idx + 1}`;
          const id = String(rawId); // GIỮ ID GỐC để gọi API

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
            (pick(d, [
              "phone",
              "Phone",
              "phoneNumber",
              "user.phone",
              "profile.phone",
            ]) as string) || "—";

          const activeRaw = pick(d, ["isActive", "active", "status", "Status"]);
          const status: "Active" | "Inactive" = toBool(activeRaw)
            ? "Active"
            : "Inactive";

          return {
            id, // ID gốc
            rowKey: `${id}-${idx}`, // key duy nhất cho React
            avatar,
            name,
            specialty,
            phone,
            status,
          };
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
  }, [isAdmin]);

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
      <TableRow key={d.rowKey}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={d.avatar || DEFAULT_AVATAR}
                alt={safeString(d.name, "Doctor")}
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div>
              <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {safeString(d.name)}
              </span>
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                ID: {safeString(d.id)}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {safeString(d.specialty)}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {safeString(d.phone)}
        </TableCell>

        <TableCell className="px-4 py-3">
          <Badge size="sm" color={d.status === "Active" ? "success" : "warning"}>
            {d.status}
          </Badge>
        </TableCell>

        {isAdmin && (
          <TableCell className="px-4 py-3 text-right">
            <button
              onClick={() => openEditModal(d)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              View
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
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Doctor
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Specialty
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
                  Status
                </TableCell>
                {isAdmin && (
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
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

      {/* === Modal (Admin only) === */}
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
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Avatar */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={form.avatarUrl || DEFAULT_AVATAR}
                  alt={safeString(form.fullName, "Doctor")}
                  width={48}
                  height={48}
                  unoptimized
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {safeString(form.id)}
                </div>
                <Badge size="sm" color={!!form.isActive ? "success" : "warning"}>
                  {!!form.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* VIEW MODE */}
            {!editMode && (
              <div className="space-y-3">
                <FieldRow label="Full name">
                  {safeString(form.fullName)}
                </FieldRow>
                <FieldRow label="Specialty">
                  {safeString(form.specialization)}
                </FieldRow>
                <FieldRow label="Phone">{safeString(form.phone)}</FieldRow>
                <FieldRow label="Email">{safeString(form.email)}</FieldRow>
                <FieldRow label="License number">
                  {safeString(form.licenseNumber)}
                </FieldRow>
                <FieldRow label="Hospital">
                  {safeString(form.hospital)}
                </FieldRow>

                {feedback && (
                  <p className="text-sm text-red-500 -mt-1">{feedback}</p>
                )}

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    onClick={startEditing}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {editMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                      Full name
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fullName: e.target.value }))
                      }
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
                        setForm((f) => ({
                          ...f,
                          specialization: e.target.value,
                        }))
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
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                        License number
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                        value={form.licenseNumber}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            licenseNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                        Hospital
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                        value={form.hospital}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, hospital: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={!!form.isActive}
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
                </div>

                {feedback && (
                  <p className="text-sm text-red-500 -mt-2">{feedback}</p>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
                    onClick={cancelEditing}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

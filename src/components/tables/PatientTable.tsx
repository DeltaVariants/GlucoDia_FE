// src/components/tables/PatientTable.tsx
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
import { useAuth } from "@/context/AuthContext";

/** ====== Types ====== */
type Row = {
  id: number | string;        // id của patient record (hoặc user tùy BE)
  rowKey: string;
  userId?: number | string;   // userId liên kết
  avatar: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit: string;
  isPremium: boolean;
};

type PatientDetail = {
  id?: number | string;
  userId?: number | string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  isPremium?:
    | boolean
    | number
    | "true"
    | "false"
    | "1"
    | "0"
    | "premium"
    | "free";
  avatarUrl?: string;
  lastVisit?: string;
};

type Relationship = {
  PatientDoctorID?: number | string;
  UserID?: number | string;
  DoctorID?: number | string;
  Status?: string;
  StartDate?: string | null;
  EndDate?: string | null;
  CreatedAt?: string;
};

type SimpleUser = {
  id?: number | string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
};

/** ====== Consts ====== */
const DEFAULT_AVATAR = "/images/user/user-25.jpg";

/** ====== Utils ====== */
function safeString(v: any, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}
function toBool(v: any): boolean {
  if (v === true || v === 1 || v === "1") return true;
  const s = String(v ?? "").toLowerCase();
  return s === "true" || s === "active" || s === "premium" || s === "yes";
}
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

/** Row trình bày label/value (view mode) */
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

export default function PatientTable() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const isDoctor = String(user?.role || "").toLowerCase() === "doctor";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // view trước, edit sau
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [editId, setEditId] = useState<number | string | null>(null);

  // Form & snapshot
  const [form, setForm] = useState<Required<PatientDetail>>({
    id: "",
    userId: "",
    fullName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    isPremium: false,
    avatarUrl: "",
    lastVisit: "",
  });
  const [original, setOriginal] = useState<Required<PatientDetail> | null>(null);

  // Relationships + Following/Followers (chỉ hiển thị)
  const [rels, setRels] = useState<Relationship[]>([]);
  const [relsLoading, setRelsLoading] = useState(false);
  const [followers, setFollowers] = useState<SimpleUser[]>([]);
  const [following, setFollowing] = useState<SimpleUser[]>([]);

  /** Chọn endpoint list theo vai trò */
  function resolvePatientsEndpoint(): string {
    const role = (user?.role || "").toLowerCase();
    if (role === "admin") {
      return (API_PATHS as any).adminPatients || `${API_PATHS.patients}?all=1`;
    }
    if (role === "doctor") {
      return API_PATHS.myPatients || API_PATHS.patients;
    }
    return API_PATHS.patients;
  }

  /** Load list */
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      setErr("");
      setLoading(true);
      try {
        const url = resolvePatientsEndpoint();
        const res = await httpGet<any>(url);

        const list: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : [];

        const mapped: Row[] = list.map((p: any, idx: number) => {
          const rawId = pick(p, ["id", "patientId", "userId", "Id"]) ?? idx + 1;
          const id = String(rawId);

          const pickedName = pick(p, [
            "fullName",
            "name",
            "profile.fullName",
            "user.fullName",
            "user.name",
          ]) as string | undefined;

          const derivedName = [
            pick(p, ["firstName", "user.firstName"]),
            pick(p, ["lastName", "user.lastName"]),
          ]
            .filter(Boolean)
            .join(" ");

          const fullName = pickedName ?? (derivedName || `Patient ${id}`);

          const avatar =
            (pick(p, [
              "avatarUrl",
              "avatar",
              "photo",
              "image",
              "user.avatarUrl",
              "user.photo",
              "profile.avatar",
            ]) as string) || DEFAULT_AVATAR;

          const dob =
            (pick(p, ["dateOfBirth", "dob", "birthday"]) as string) || "";
          const phone =
            (pick(p, ["phone", "phoneNumber", "user.phone"]) as string) || "";
          const lastVisit =
            (pick(p, ["lastVisit", "lastCheckin", "updatedAt", "createdAt"]) as
              | string
              | undefined) || "";
          const isPremium = toBool(
            pick(p, ["isPremium", "premium", "membership", "plan"])
          );

          const userIdFromList =
            pick(p, ["userId", "UserID", "accountId"]) ?? rawId;

          return {
            id,
            rowKey: `${id}-${idx}`,
            userId: userIdFromList,
            name: String(fullName),
            avatar,
            dob,
            phone,
            lastVisit,
            isPremium,
          };
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

  /** Helpers mapping followers/following list */
  function mapUsers(arr: any[]): SimpleUser[] {
    return (arr || []).map((u, i) => ({
      id:
        pick(u, ["id", "userId", "UserID"]) ??
        pick(u, ["User.id", "UserID"]) ??
        i,
      fullName:
        (pick(u, ["fullName", "name", "User.fullName"]) as string) ??
        safeString("", "—"),
      name:
        (pick(u, ["name", "User.name"]) as string) ??
        (pick(u, ["fullName"]) as string) ??
        undefined,
      avatarUrl:
        (pick(u, ["avatarUrl", "avatar", "User.avatarUrl"]) as string) ??
        DEFAULT_AVATAR,
    }));
  }

  /** Mở modal -> VIEW MODE (có relationships + danh sách followers/following) */
  async function openViewModal(row: Row) {
    setOpen(true);
    setEditMode(false);
    setFeedback("");
    setEditId(row.id);
    setRels([]);
    setRelsLoading(true);
    setFollowers([]);
    setFollowing([]);

    // Seed trước
    const seed: Required<PatientDetail> = {
      id: row.id,
      userId: (row.userId as any) ?? "",
      fullName: row.name || "",
      dateOfBirth: row.dob || "",
      phone: row.phone || "",
      email: "",
      address: "",
      isPremium: row.isPremium,
      avatarUrl: row.avatar || DEFAULT_AVATAR,
      lastVisit: row.lastVisit || "",
    };
    setForm(seed);
    setOriginal(seed);

    try {
      // 1) detail (admin -> fallback patientById)
      let detail: any = null;
      if (isAdmin) {
        try {
          detail = await httpGet<any>(API_PATHS.adminPatientById(row.id));
        } catch (e: any) {
          const msg = e?.body?.message || e?.message || "";
          if (msg) setFeedback(String(msg));
        }
      }
      if (!detail) {
        try {
          detail = await httpGet<any>(API_PATHS.patientById(row.id));
        } catch (e: any) {
          const msg =
            e?.body?.message ||
            e?.message ||
            "Không thể tải thông tin chi tiết bệnh nhân.";
          setFeedback((prev) => (prev ? prev + " | " + String(msg) : String(msg)));
        }
      }

      const d: PatientDetail = (detail?.data ?? detail ?? {}) as PatientDetail;

      // 2) MERGE form
      const merged: Required<PatientDetail> = {
        id: (d.id ?? row.id) as any,
        userId:
          (pick(d, ["userId", "UserID", "user.id", "accountId"]) as
            | string
            | number
            | undefined) ?? (row.userId as any) ?? "",
        fullName:
          (pick(d, ["fullName", "name", "user.fullName", "profile.fullName"]) as
            | string
            | undefined) ?? seed.fullName,
        dateOfBirth:
          (pick(d, ["dateOfBirth", "dob", "birthday"]) as string | undefined) ??
          seed.dateOfBirth,
        phone:
          (pick(d, ["phone", "phoneNumber", "user.phone"]) as
            | string
            | undefined) ?? seed.phone,
        email:
          (pick(d, ["email", "user.email"]) as string | undefined) ??
          seed.email,
        address:
          (pick(d, ["address", "homeAddress"]) as string | undefined) ??
          seed.address,
        isPremium: toBool(
          pick(d, ["isPremium", "premium", "membership", "plan"]) ??
            seed.isPremium
        ),
        avatarUrl:
          (pick(d, [
            "avatarUrl",
            "avatar",
            "user.avatarUrl",
            "profile.avatar",
          ]) as string | undefined) ?? seed.avatarUrl,
        lastVisit:
          (pick(d, ["lastVisit", "lastCheckin", "updatedAt", "createdAt"]) as
            | string
            | undefined) ?? seed.lastVisit,
      };

      setForm(merged);
      setOriginal(merged);

      // 3) RELATIONSHIPS + danh sách FOLLOWERS/FOLLOWING (chỉ hiển thị)
      const possibleUserId =
        merged.userId ||
        row.userId ||
        pick(d, ["userId", "UserID", "user.id"]) ||
        row.id;

      if (possibleUserId) {
        try {
          const ures = await httpGet<any>(API_PATHS.userFullById(possibleUserId));
          const relList: Relationship[] =
            (pick(ures, ["data.relationships", "relationships"]) as
              | Relationship[]
              | undefined) ?? [];
          setRels(Array.isArray(relList) ? relList : []);
        } catch (er: any) {
          const m =
            er?.body?.message ||
            er?.message ||
            "Không thể tải relationships của người dùng.";
          setFeedback((prev) => (prev ? prev + " | " + String(m) : String(m)));
        }

        try {
          const fres = await httpGet<any>(API_PATHS.userFollowers(possibleUserId));
          const arr: any[] =
            (Array.isArray(fres) ? fres : fres?.data) ??
            fres?.items ??
            fres?.data?.items ??
            [];
          setFollowers(mapUsers(arr));
        } catch {}

        try {
          const gres = await httpGet<any>(API_PATHS.userFollowing(possibleUserId));
          const arr: any[] =
            (Array.isArray(gres) ? gres : gres?.data) ??
            gres?.items ??
            gres?.data?.items ??
            [];
          setFollowing(mapUsers(arr));
        } catch {}
      }
    } finally {
      setRelsLoading(false);
    }
  }

  /** Chỉ admin mới bật edit mode */
  function startEditing() {
    if (!isAdmin) return;
    setEditMode(true);
    setFeedback("");
  }

  /** Hủy -> khôi phục original & quay lại view */
  function cancelEditing() {
    if (original) setForm(original);
    setEditMode(false);
    setFeedback("");
  }

  /** Lưu thay đổi (admin only) */
  async function savePatient() {
    if (!isAdmin || editId == null || !editMode) return;
    setSaving(true);
    setFeedback("");

    try {
      const payload: any = {
        fullName: form.fullName?.trim(),
        dateOfBirth: form.dateOfBirth?.trim(),
        phone: form.phone?.trim(),
        email: form.email?.trim(),
        address: form.address?.trim(),
        isPremium: !!form.isPremium,
      };
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === "" || v === undefined) delete payload[k];
      });

      await httpPut(API_PATHS.adminUpdatePatient(editId), payload);

      // sync lại bảng
      setRows((prev) =>
        prev.map((r) =>
          String(r.id) === String(editId)
            ? {
                ...r,
                name: payload.fullName ?? r.name,
                dob: payload.dateOfBirth ?? r.dob,
                phone: payload.phone ?? r.phone,
                lastVisit: r.lastVisit,
                isPremium:
                  payload.isPremium !== undefined
                    ? !!payload.isPremium
                    : r.isPremium,
              }
            : r
        )
      );

      // cập nhật snapshot & quay về view mode
      const updatedOriginal = {
        ...form,
        isPremium: !!(payload.isPremium ?? form.isPremium),
      } as Required<PatientDetail>;
      setOriginal(updatedOriginal);
      setForm(updatedOriginal);
      setEditMode(false);
      setFeedback("");
    } catch (e: any) {
      const msg =
        e?.body?.message || e?.message || "Cập nhật thông tin bệnh nhân thất bại.";
      setFeedback(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setSaving(false);
    }
  }

  /** Render body bảng */
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
      <TableRow key={p.rowKey}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={p.avatar || DEFAULT_AVATAR}
                alt={safeString(p.name, "Patient")}
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div>
              <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {safeString(p.name)}
              </span>
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                ID: {safeString(p.id)}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {safeString(p.dob)}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {safeString(p.phone)}
        </TableCell>

        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">
          {safeString(p.lastVisit)}
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

        {(isAdmin || isDoctor) && (
          <TableCell className="px-4 py-3 text-right">
            <button
              onClick={() => openViewModal(p)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              View
            </button>
          </TableCell>
        )}
      </TableRow>
    ));
  }, [rows, loading, authLoading, err, isAdmin, isDoctor]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1080px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Patient
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  DOB
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Last Visit
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Membership
                </TableCell>
                {(isAdmin || isDoctor) && (
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {content}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Modal View/Edit === */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Patient Information
              </h3>
              <button
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Header avatar + tag (đã bỏ Follow/Unfollow) */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={form.avatarUrl || DEFAULT_AVATAR}
                  alt={safeString(form.fullName, "Patient")}
                  width={48}
                  height={48}
                  unoptimized
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {safeString(form.id)}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    form.isPremium
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {form.isPremium ? "Premium" : "Free"}
                </span>
              </div>
            </div>

            {/* VIEW MODE */}
            {!editMode && (
              <div className="space-y-4">
                <FieldRow label="Full name">{safeString(form.fullName)}</FieldRow>
                <FieldRow label="DOB">{safeString(form.dateOfBirth)}</FieldRow>
                <FieldRow label="Phone">{safeString(form.phone)}</FieldRow>
                <FieldRow label="Email">{safeString(form.email)}</FieldRow>
                <FieldRow label="Address">{safeString(form.address)}</FieldRow>
                <FieldRow label="Last Visit">{safeString(form.lastVisit)}</FieldRow>

                {/* Relationships */}
                <div className="mt-3">
                  <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Relationships
                  </div>

                  {relsLoading && (
                    <p className="text-sm text-gray-500">Đang tải relationships…</p>
                  )}

                  {!relsLoading && (!rels || rels.length === 0) && (
                    <p className="text-sm text-gray-500">Không có dữ liệu.</p>
                  )}

                  {!relsLoading && rels.length > 0 && (
                    <div className="space-y-2">
                      {rels.map((r, i) => {
                        const userIdStr = String(form.userId || "");
                        const relUserStr = r.UserID != null ? String(r.UserID) : "";
                        const isSelfFollowing =
                          userIdStr && relUserStr && userIdStr === relUserStr;

                        const directionLabel = isSelfFollowing
                          ? `Theo dõi bác sĩ #${safeString(r.DoctorID)}`
                          : `Được theo dõi bởi #${safeString(r.UserID)}`;

                        const status = String(r.Status || "").toLowerCase();
                        const badge =
                          status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700";

                        return (
                          <div
                            key={`${r.PatientDoctorID ?? i}`}
                            className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.08]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-800 dark:text-white/90">
                                {directionLabel}
                              </div>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}
                              >
                                {safeString(r.Status, "unknown")}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Bắt đầu: {safeString(r.StartDate)} {" · "}
                              Kết thúc: {safeString(r.EndDate)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* FOLLOWING + FOLLOWERS (chỉ xem) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Đang theo dõi (Following) — {following.length}
                    </div>
                    {following.length === 0 ? (
                      <p className="text-sm text-gray-500">—</p>
                    ) : (
                      <ul className="space-y-1">
                        {following.map((u, idx) => (
                          <li
                            key={`${u.id ?? idx}-following`}
                            className="flex items-center gap-2 text-sm text-gray-800 dark:text-white/90"
                          >
                            <span className="h-6 w-6 overflow-hidden rounded-full bg-gray-100">
                              <Image
                                src={u.avatarUrl || DEFAULT_AVATAR}
                                alt={safeString(u.fullName || u.name, "User")}
                                width={24}
                                height={24}
                                unoptimized
                              />
                            </span>
                            <span>{safeString(u.fullName || u.name)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Người theo dõi (Followers) — {followers.length}
                    </div>
                    {followers.length === 0 ? (
                      <p className="text-sm text-gray-500">—</p>
                    ) : (
                      <ul className="space-y-1">
                        {followers.map((u, idx) => (
                          <li
                            key={`${u.id ?? idx}-follower`}
                            className="flex items-center gap-2 text-sm text-gray-800 dark:text-white/90"
                          >
                            <span className="h-6 w-6 overflow-hidden rounded-full bg-gray-100">
                              <Image
                                src={u.avatarUrl || DEFAULT_AVATAR}
                                alt={safeString(u.fullName || u.name, "User")}
                                width={24}
                                height={24}
                                unoptimized
                              />
                            </span>
                            <span>{safeString(u.fullName || u.name)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {feedback && (
                  <p className="text-sm text-red-500 -mt-1">{feedback}</p>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  {isAdmin && (
                    <button
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      onClick={startEditing}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* EDIT MODE (Admin only) */}
            {editMode && isAdmin && (
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
                      DOB
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
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

                  <div>
                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
                      Address
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-transparent dark:text-white/90"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isPremium"
                      type="checkbox"
                      checked={!!form.isPremium}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isPremium: e.target.checked }))
                      }
                    />
                    <label
                      htmlFor="isPremium"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Premium member
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
                    onClick={savePatient}
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

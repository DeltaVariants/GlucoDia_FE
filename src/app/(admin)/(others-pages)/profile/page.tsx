"use client";

import React, { useEffect, useState } from "react";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import { httpGet, httpPut } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";
import { useRouter } from "next/navigation";

const SIGNIN_PATH = "/signin";

type Me = {
  id?: number | string;
  email?: string;
  fullName?: string;
  type?: "patient" | "doctor";
  diabetesType?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;

  // doctor fields
  licenseNumber?: string;
  specialization?: string;
  hospital?: string;

  // address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  createdAt?: string;
} | null;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  // ---- helpers ----
  const fetchMe = async () => {
    const res = await httpGet<any>(API_PATHS.me);
    const data = res?.data ?? res;
    if (!data || typeof data !== "object") throw new Error("Dữ liệu người dùng không hợp lệ");
    setUser(data as Me);
    setForm(data as any);
  };

  useEffect(() => {
    (async () => {
      try {
        const token =
          typeof window !== "undefined" &&
          (localStorage.getItem("token") || sessionStorage.getItem("token"));

        if (!token) {
          try {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          } catch {}
          router.replace(SIGNIN_PATH);
          return;
        }

        await fetchMe();
      } catch (e: any) {
        const status = e?.status || e?.response?.status;
        const msg = e?.body?.message || e?.message || "Không thể tải thông tin người dùng.";
        setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));

        if (status === 401 || status === 403) {
          try {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          } catch {}
          router.replace(SIGNIN_PATH);
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setErr("");
    setOk("");

    try {
      const basePayload: Record<string, any> = {
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      };

      let payload = { ...basePayload };

      if (user.type === "doctor") {
        Object.assign(payload, {
          licenseNumber: form.licenseNumber,
          specialization: form.specialization,
          hospital: form.hospital,
        });
      } else {
        Object.assign(payload, {
          diabetesType: form.diabetesType,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
        });
      }

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await httpPut(API_PATHS.me, payload);
      await fetchMe();

      setEditing(false);
      setOk("Đã cập nhật hồ sơ!");
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      const msg = e?.body?.message || e?.message || "Cập nhật hồ sơ thất bại.";
      setErr(Array.isArray(msg) ? msg.join(", ") : String(msg));

      if (status === 401 || status === 403) {
        try {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        } catch {}
        router.replace(SIGNIN_PATH);
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải thông tin…</p>;
  if (err && !user) return <p className="text-red-500">{err}</p>;
  if (!user) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-5 flex items-center justify-between lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Hồ sơ cá nhân</h3>
        {!editing ? (
          <button
            onClick={() => { setEditing(true); setOk(""); }}
            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Chỉnh sửa
          </button>
        ) : (
          <div className="space-x-2">
            <button
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              disabled={saving}
              onClick={() => { setEditing(false); setForm(user); }}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {ok && <p className="mb-4 text-sm text-green-600">{ok}</p>}

      <div className="space-y-6">
        <UserMetaCard user={user} />
        <UserInfoCard user={user} />
        <UserAddressCard user={user} />
      </div>

      {editing && (
        <div className="mt-8 rounded-xl border p-4">
          <h4 className="mb-4 font-medium">Cập nhật thông tin</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Họ và tên" value={form.fullName ?? ""} onChange={(v) => handleChange("fullName", v)} />
            <TextField label="Số điện thoại" value={form.phone ?? ""} onChange={(v) => handleChange("phone", v)} />
            <TextField label="Ngày sinh (YYYY-MM-DD)" value={form.dateOfBirth ?? ""} onChange={(v) => handleChange("dateOfBirth", v)} />
            <SelectField
              label="Giới tính"
              value={form.gender ?? ""}
              onChange={(v) => handleChange("gender", v)}
              options={[
                { label: "Nam", value: "Male" },
                { label: "Nữ", value: "Female" },
                { label: "Khác", value: "Other" },
              ]}
            />

            {user.type === "doctor" ? (
              <>
                <TextField label="Số giấy phép" value={form.licenseNumber ?? ""} onChange={(v) => handleChange("licenseNumber", v)} />
                <TextField label="Chuyên môn" value={form.specialization ?? ""} onChange={(v) => handleChange("specialization", v)} />
                <TextField label="Bệnh viện" value={form.hospital ?? ""} onChange={(v) => handleChange("hospital", v)} />
              </>
            ) : (
              <>
                <TextField label="Loại tiểu đường" value={form.diabetesType ?? ""} onChange={(v) => handleChange("diabetesType", v)} />
                <TextField label="Địa chỉ (line 1)" value={form.addressLine1 ?? ""} onChange={(v) => handleChange("addressLine1", v)} />
                <TextField label="Địa chỉ (line 2)" value={form.addressLine2 ?? ""} onChange={(v) => handleChange("addressLine2", v)} />
                <TextField label="Thành phố" value={form.city ?? ""} onChange={(v) => handleChange("city", v)} />
                <TextField label="Tỉnh/Bang" value={form.state ?? ""} onChange={(v) => handleChange("state", v)} />
                <TextField label="Mã bưu chính" value={form.postalCode ?? ""} onChange={(v) => handleChange("postalCode", v)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Input components */
function TextField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex w-full flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="flex w-full flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      <select
        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Chọn --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

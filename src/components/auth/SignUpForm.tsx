"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { httpPost } from "@/lib/http";
import { API_PATHS } from "@/services/apiPaths";

type DoctorRegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  licenseNumber: string;
  specialization: string;
  hospital: string;
};

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // để ghép fullName
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  // bắt buộc theo BE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  function validate(): string | null {
    const _email = email.trim().toLowerCase();
    const _pwd = password;
    const _fullName = `${fname} ${lname}`.replace(/\s+/g, " ").trim();
    const _license = licenseNumber.trim();
    const _spec = specialization.trim();
    const _hos = hospital.trim();

    if (!agreeTerms) return "Bạn cần đồng ý Điều khoản & Chính sách trước khi đăng ký.";
    if (!_fullName || !_email || !_pwd || !_license || !_spec || !_hos)
      return "Vui lòng điền đầy đủ thông tin bắt buộc.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_email)) return "Email không hợp lệ.";
    if (_pwd.length < 8) return "Mật khẩu tối thiểu 8 ký tự.";
    // ví dụ validate CCHN cơ bản (bạn có thể nới lỏng theo BE)
    if (_license.length < 6) return "Số chứng chỉ hành nghề không hợp lệ.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const v = validate();
    if (v) { setErr(v); return; }

    const payload: DoctorRegisterPayload = {
      email: email.trim().toLowerCase(),
      password,
      fullName: `${fname} ${lname}`.replace(/\s+/g, " ").trim(),
      licenseNumber: licenseNumber.trim(),
      specialization: specialization.trim(),
      hospital: hospital.trim(),
    };

    setLoading(true);
    try {
      // đảm bảo API_PATHS.register = "/api/auth/register/doctor"
      const res = await httpPost<Record<string, any>>(API_PATHS.register, payload);

      // Nếu BE trả token -> đăng nhập ngay
      const token =
        res?.token ?? res?.accessToken ?? res?.data?.token ?? res?.data?.accessToken;

      if (token) {
        localStorage.setItem("token", token);
        router.push("/");
      } else {
        // nếu không có token thì điều hướng tới trang đăng nhập
        router.push("/signin");
      }
    } catch (e: any) {
      // gom message chi tiết từ BE (NestJS/class-validator thường trả mảng)
      const m =
        e?.response?.data?.message ??
        e?.data?.message ??
        e?.message ??
        "Đăng ký bác sĩ thất bại. Vui lòng thử lại.";
      setErr(Array.isArray(m) ? m.join(", ") : m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up (Doctor)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đăng ký tài khoản Bác sĩ để sử dụng hệ thống.
            </p>
          </div>

          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label>First Name<span className="text-error-500">*</span></Label>
                  <Input id="fname" value={fname} onChange={(e) => setFname(e.target.value)} required />
                </div>
                <div className="sm:col-span-1">
                  <Label>Last Name<span className="text-error-500">*</span></Label>
                  <Input id="lname" value={lname} onChange={(e) => setLname(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label>Password<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="At least 8 characters"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> :
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                  </span>
                </div>
              </div>

              {/* Doctor fields */}
              <div>
                <Label>Số chứng chỉ hành nghề<span className="text-error-500">*</span></Label>
                <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
              </div>

              <div>
                <Label>Chuyên khoa<span className="text-error-500">*</span></Label>
                <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
              </div>

              <div>
                <Label>Bệnh viện / Cơ sở công tác<span className="text-error-500">*</span></Label>
                <Input id="hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox className="w-5 h-5" checked={agreeTerms} onChange={setAgreeTerms} />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  Bằng việc tạo tài khoản, bạn đồng ý với{" "}
                  <span className="text-gray-800 dark:text-white/90">Điều khoản</span> và{" "}
                  <span className="text-gray-800 dark:text-white">Chính sách bảo mật</span>.
                </p>
              </div>

              {err && <p className="text-error-500 text-sm -mt-2">{err}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60"
                >
                  {loading ? "Signing up..." : "Sign Up (Doctor)"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Đã có tài khoản?{" "}
              <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

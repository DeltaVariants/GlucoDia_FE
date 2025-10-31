"use client";

type Me = {
  email?: string;
  fullName?: string;
  type?: "patient" | "doctor";
  diabetesType?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt?: string;
};

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-800 dark:text-white/90 break-words">
        {value && value !== "" ? value : "—"}
      </p>
    </div>
  );
}

export default function UserInfoCard({ user }: { user: Me | null }) {
  const fmtDOB =
    user?.dateOfBirth
      ? new Date(user.dateOfBirth).toLocaleDateString()
      : undefined;

  const fmtCreated =
    user?.createdAt ? new Date(user.createdAt).toLocaleString() : undefined;

  return (
    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      <h5 className="mb-4 font-medium text-gray-800 dark:text-white/90">
        Personal Information
      </h5>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Row label="Full Name" value={user?.fullName} />
        <Row label="User Type" value={user?.type} />
        <Row label="Email" value={user?.email} />
        <Row label="Phone" value={user?.phone} />
        <Row label="Gender" value={user?.gender} />
        <Row label="Date of Birth" value={fmtDOB} />
        <Row label="Diabetes Type" value={user?.diabetesType} />
        <Row label="Created At" value={fmtCreated} />
      </div>
    </div>
  );
}

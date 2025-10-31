"use client";

type Me = {
  type?: "patient" | "doctor";
  licenseNumber?: string;
  specialization?: string;
  hospital?: string;
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

export default function UserAddressCard({ user }: { user: Me | null }) {
  if (!user || user.type !== "doctor") return null; // chỉ hiện với doctor

  return (
    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      <h5 className="mb-4 font-medium text-gray-800 dark:text-white/90">
        Professional (Doctor)
      </h5>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Row label="License Number" value={user.licenseNumber} />
        <Row label="Specialization" value={user.specialization} />
        <Row label="Hospital" value={user.hospital} />
      </div>
    </div>
  );
}

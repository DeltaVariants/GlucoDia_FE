"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

type Patient = {
  id: number;
  avatar: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit: string;
  isPremium: boolean; // ✅ thêm cột Premium
};

const rows: Patient[] = [
  { id: 101, avatar: "/images/user/user-22.jpg", name: "Alice Nguyen", dob: "1995-01-10", phone: "0912 000 111", lastVisit: "2025-10-01", isPremium: true },
  { id: 102, avatar: "/images/user/user-23.jpg", name: "Bob Tran",     dob: "1990-06-22", phone: "0912 000 222", lastVisit: "2025-10-10", isPremium: false },
  { id: 103, avatar: "/images/user/user-24.jpg", name: "Chris Pham",   dob: "1998-12-05", phone: "0912 000 333", lastVisit: "2025-09-28", isPremium: true },
];

export default function PatientTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Patient</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">DOB</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Last Visit</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Membership</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <Image src={p.avatar} alt={p.name} width={40} height={40} />
                      </div>
                      <div>
                        <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">{p.name}</span>
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">ID: {p.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">{p.dob}</TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">{p.phone}</TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">{p.lastVisit}</TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm">
                    {p.isPremium ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Premium</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Free</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

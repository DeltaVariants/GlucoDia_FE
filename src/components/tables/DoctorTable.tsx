"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

type Doctor = {
  id: number;
  avatar: string;
  name: string;
  specialty: string;
  phone: string;
  status: "Active" | "Inactive";
};

const rows: Doctor[] = [
  { id: 1, avatar: "/images/user/user-17.jpg", name: "Dr. John Doe", specialty: "Cardiology", phone: "0900 111 222", status: "Active" },
  { id: 2, avatar: "/images/user/user-18.jpg", name: "Dr. Jane Smith", specialty: "Dermatology", phone: "0900 333 444", status: "Inactive" },
  { id: 3, avatar: "/images/user/user-21.jpg", name: "Dr. Alex Kim", specialty: "Endocrinology", phone: "0900 555 666", status: "Active" },
];

export default function DoctorTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Doctor</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Specialty</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <Image src={d.avatar} alt={d.name} width={40} height={40} />
                      </div>
                      <div>
                        <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">{d.name}</span>
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">ID: {d.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">{d.specialty}</TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-400">{d.phone}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge size="sm" color={d.status === "Active" ? "success" : "warning"}>{d.status}</Badge>
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

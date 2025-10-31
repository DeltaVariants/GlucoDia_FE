// src/app/patient/page.tsx (Giả định vị trí)
"use client"; // Đảm bảo đây là Client Component

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PatientTable from "@/components/tables/PatientTable";
import { useAuth } from "@/context/AuthContext"; // 👈 Import useAuth
import { useRouter } from "next/navigation"; // 👈 Import useRouter
import { useEffect } from "react"; // 👈 Import useEffect

export default function PatientPage() {
  const { user, loading } = useAuth(); // Lấy trạng thái user và loading
  const router = useRouter();

  // Logic kiểm tra đăng nhập và chuyển hướng
  useEffect(() => {
    // 1. Nếu AuthContext đã load xong và user là NULL (chưa đăng nhập), chuyển hướng
    if (!loading && !user) {
      // Chuyển hướng đến trang đăng nhập
      router.replace(`/signin?redirect=${window.location.pathname}`);
    }
    
    // 2. [TÙY CHỌN] Logic kiểm tra vai trò (ví dụ: chỉ Admin/Doctor được xem danh sách Patient)
    // Giả sử chỉ 'admin' và 'doctor' được phép
    const allowedRoles = ["admin", "doctor"]; 
    if (!loading && user && user.role && !allowedRoles.includes(user.role)) {
        // Nếu user không có role hoặc role không được phép, chuyển hướng về trang chủ
        router.replace("/");
    }
    
  }, [user, loading, router]);
  
  // Hiển thị màn hình loading hoặc rỗng trong khi chờ kiểm tra Auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Nếu user đã đăng nhập (và có quyền), render nội dung trang
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage User / Patient" />
      <div className="space-y-6">
        <ComponentCard title="Patient List">
          <PatientTable />
        </ComponentCard>
      </div>
    </div>
  );
}
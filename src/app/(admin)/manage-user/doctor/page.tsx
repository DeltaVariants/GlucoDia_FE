// src/app/doctor/page.tsx (Giả định vị trí)
"use client"; // Đảm bảo đây là Client Component

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DoctorTable from "@/components/tables/DoctorTable";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/navigation"; // Import useRouter
import { useEffect } from "react"; // Import useEffect

export default function DoctorPage() {
  const { user, loading } = useAuth(); // Lấy trạng thái user và loading
  const router = useRouter();

  // Logic kiểm tra đăng nhập và chuyển hướng
  useEffect(() => {
    // 1. Nếu AuthContext đã load xong và user là NULL (chưa đăng nhập), chuyển hướng
    if (!loading && !user) {
      // Chuyển hướng đến trang đăng nhập. Có thể thêm query param để chuyển hướng ngược lại sau khi login.
      router.replace(`/signin?redirect=${window.location.pathname}`);
    }
  }, [user, loading, router]);
  
  // Hiển thị màn hình loading hoặc rỗng trong khi chờ kiểm tra Auth
  // Điều kiện: Đang loading HOẶC (đã load xong nhưng không có user)
  if (loading || !user) {
    // Nếu loading, hiển thị spinner hoặc thông báo
    // Nếu !user, màn hình này sẽ hiện ra trong tích tắc trước khi router.replace chạy
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang kiểm tra quyền truy cập...</p>
        {/* Bạn có thể thay bằng component spinner nếu có */}
      </div>
    );
  }

  // Nếu user đã đăng nhập (loading=false và user!=null), render nội dung trang
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage User / Doctor" />
      <div className="space-y-6">
        <ComponentCard title="Doctor List">
          <DoctorTable />
        </ComponentCard>
      </div>
    </div>
  );
}
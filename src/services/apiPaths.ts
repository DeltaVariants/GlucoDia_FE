// src/services/apiPaths.ts

// ========================
// BASE API PATHS
// ========================

export const API_PATHS = {
  // ========================
  // AUTHENTICATION
  // ========================
  login: "/api/auth/login",
  register: "/api/auth/register/doctor",
  me: "/api/auth/me",
  logout: "/api/auth/logout",

  // ========================
  // USERS
  // ========================
  users: "/api/users",
  userById: (id: string | number) => `/api/users/${id}`,
  /** Lấy hồ sơ cá nhân + toàn bộ dữ liệu liên quan */
  userFullById: (id: string | number) => `/api/users/${id}/full`,

  // ========================
  // FOLLOW SYSTEM
  // ========================
  /** Follow một người dùng */
  followUser: (id: string | number) => `/api/users/${id}/follow`,
  /** Hủy follow một người dùng */
  unfollowUser: (id: string | number) => `/api/users/${id}/follow`,
  /** Danh sách người theo dõi user */
  userFollowers: (id: string | number) => `/api/users/${id}/followers`,
  /** Danh sách user mà người này đang theo dõi */
  userFollowing: (id: string | number) => `/api/users/${id}/following`,
  /** Kiểm tra người dùng hiện tại có đang follow ID này không */
  isFollowing: (id: string | number) => `/api/users/${id}/is-following`,

  // ========================
  // PATIENTS
  // ========================
  patients: "/api/patients",
  patientById: (id: string | number) => `/api/patients/${id}`,
  updatePatient: (id: string | number) => `/api/patients/${id}`,
  patientsRecent: "/api/patients/recent",

  // ========================
  // DOCTORS
  // ========================
  doctors: "/api/doctors",
  doctorById: (id: string | number) => `/api/doctors/${id}`,
  updateDoctor: (id: string | number) => `/api/doctors/${id}`,
  myPatients: "/api/doctors/me/patients",

  // ========================
  // ADMIN - OVERVIEW
  // ========================
  adminOverview: "/api/admin/overview",
  adminChartsUsers: "/api/admin/charts/users",
  adminChartsRevenue: "/api/admin/charts/revenue",
  adminRecentUsers: "/api/admin/recent/users",
  adminRecentArticles: "/api/admin/recent/articles",

  // ========================
  // ADMIN - PATIENTS
  // ========================
  adminPatients: "/api/admin/patients",
  adminPatientOverview: (id: string | number) =>
    `/api/admin/patients/${id}/overview`,
  adminPatientGlucose: (id: string | number) =>
    `/api/admin/patients/${id}/glucose`,
  adminPatientMeals: (id: string | number) =>
    `/api/admin/patients/${id}/meals`,
  adminPatientMeds: (id: string | number) =>
    `/api/admin/patients/${id}/medications`,

  // ➕ NEW: ADMIN - PATIENT DETAILS (Xem & chỉnh sửa)
  adminPatientById: (id: string | number) => `/api/admin/patients/${id}`,
  adminUpdatePatient: (id: string | number) => `/api/admin/patients/${id}`,

  // ========================
  // ADMIN - DOCTORS MANAGEMENT
  // ========================
  adminDoctors: "/api/admin/doctors",

  // ➕ NEW: ADMIN - DOCTOR DETAILS (Xem & chỉnh sửa)
  adminDoctorById: (id: string | number) => `/api/admin/doctors/${id}`,
  adminUpdateDoctor: (id: string | number) => `/api/admin/doctors/${id}`,

  // ========================
  // ADMIN - ARTICLES
  // ========================
  adminArticles: "/api/admin/articles",
  adminArticleById: (id: string | number) => `/api/admin/articles/${id}`,
  adminCreateArticle: "/api/admin/articles", // POST

  // ========================
  // SYSTEM / DASHBOARD
  // ========================
  statsOverview: "/api/admin/stats/overview",
  statsDoctors: "/api/admin/stats/doctors",
  statsPatients: "/api/admin/stats/patients",
};

// ========================
// DEFAULT EXPORT
// ========================
export default API_PATHS;

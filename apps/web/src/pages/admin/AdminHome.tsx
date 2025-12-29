import { useNavigate } from "react-router-dom";
import "./admin.css";
import AdminCompanies from "./AdminCompanies";
import AdminCommunityTips from "./AdminCommunityTips";
import { useState } from "react";
import AdminReportsOverview from "./AdminReportsOverview";




export default function AdminHome() {

  const [activePage, setActivePage] = useState<"companies" | "tips" | "reports">("companies");


  const navigate = useNavigate();

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    return <div className="ad-wrap">Bạn chưa đăng nhập.</div>;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="ad-wrap">
        <div className="ad-card">
          <div className="ad-title">Không có quyền truy cập</div>
          <div className="ad-muted">Trang này chỉ dành cho ADMIN.</div>

          <div style={{ marginTop: 12 }}>
            <button className="ad-btn" onClick={() => navigate("/home")}>
              Về trang Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-layout">
      <aside className="ad-sidebar">
        <div className="ad-brand">🚑 Rescue Admin</div>

        <nav className="ad-nav">
          <button
            className={`ad-navItem ${activePage === "companies" ? "active" : ""}`}
            onClick={() => setActivePage("companies")}
          >
            Duyệt công ty
          </button>

          <button
            className={`ad-navItem ${activePage === "tips" ? "active" : ""}`}
            onClick={() => setActivePage("tips")}
          >
            Community Tips
          </button>

          <button
            className={`ad-navItem ${activePage === "reports" ? "active" : ""}`}
            onClick={() => setActivePage("reports")}
          >
            Thống kê
          </button>

        


        {/* <div style={{ flex: 1 }} /> */}

          <button
            className="ad-navItem danger"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("user");
              navigate("/auth/login");
            }}
          >
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div>
            <div className="ad-h1">Duyệt tài khoản công ty</div>
            <div className="ad-muted">
              Bước 1: dựng khung + routing. Bước sau sẽ gọi API /admin/companies.
            </div>
          </div>

          <div className="ad-userBox">
            <div className="ad-userName">{user.name || "Admin"}</div>
            <div className="ad-userRole">{user.email}</div>
          </div>
        </header>

        {activePage === "companies" ? (
          <AdminCompanies />
        ) : activePage === "tips" ? (
          <AdminCommunityTips />
        ) : (
          <AdminReportsOverview />
        )}



      </main>
    </div>
  );
}

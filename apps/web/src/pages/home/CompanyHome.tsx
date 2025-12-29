import { useEffect, useMemo, useState } from "react";
import AppShell from "./AppShell";
import BottomNav from "./BottomNav";
import "./home.css";
import { useNavigate } from "react-router-dom"; // thêm ở đầu file

type CompanyRequest = {
  id: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  categoryId: string;
  quotedBasePrice: number;
  issueType: string;
  note?: string;
  contactName: string;
  contactPhone: string;
  addressText?: string;
  location: { lat: number; lng: number };
  createdAt: string;
};

type ListResp = {
  status: string;
  count: number;
  items: CompanyRequest[];
};

function StatCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="stat stat-btn"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      aria-label={label}
    >
      <div className="stat-top">
        <div className="stat-ico">{icon}</div>
        <div className="stat-val">{value}</div>
      </div>
      <div className="stat-lbl">{label}</div>
    </button>
  );
}


function ManageTile({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="tile" onClick={onClick}>
      <div className="tile-ico">{icon}</div>
      <div className="tile-lbl">{label}</div>
    </button>
  );
}

export default function CompanyHome() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const companyName = user?.companyName || "Cứu hộ Minh Tâm";
  const companyStatus = user?.companyStatus || "PENDING";
  const isActive = companyStatus === "ACTIVE";

  const statusText = useMemo(() => {
    if (companyStatus === "ACTIVE") return "Đang hoạt động";
    if (companyStatus === "PENDING") return "Chờ admin phê duyệt";
    if (companyStatus === "REJECTED") return "Bị từ chối";
    if (companyStatus === "SUSPENDED") return "Tạm khóa";
    return `Trạng thái: ${companyStatus}`;
  }, [companyStatus]);

  // ====== DATA (real) ======
  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);

  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [doneTodayCount, setDoneTodayCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  const isToday = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  };

  const fetchByStatus = async (status: string): Promise<ListResp> => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API}/company/requests?status=${encodeURIComponent(status)}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Fetch ${status} failed`);
    return data as ListResp;
  };

  const refreshStats = async () => {
    if (!isActive) return; // company chưa ACTIVE thì không gọi
    setLoadingStats(true);
    setStatsError("");

    try {
      const [pending, assigned, inprog, completed, cancelled] = await Promise.all([
        fetchByStatus("PENDING"),
        fetchByStatus("ASSIGNED"),
        fetchByStatus("IN_PROGRESS"),
        fetchByStatus("COMPLETED"),
        fetchByStatus("CANCELLED"),
      ]);

      setPendingCount(pending.count || 0);
      setInProgressCount((assigned.count || 0) + (inprog.count || 0));

      // “Hoàn thành hôm nay” = COMPLETED + CANCELLED nhưng lọc theo createdAt trong ngày
      // const doneToday =
      //   (completed.items || []).filter((x) => isToday(x.createdAt)).length +
      //   (cancelled.items || []).filter((x) => isToday(x.createdAt)).length;

      setDoneTodayCount((completed.count || 0) + (cancelled.count || 0));
    } catch (e: any) {
      setStatsError(e.message || "Không tải được thống kê");
      setPendingCount(0);
      setInProgressCount(0);
      setDoneTodayCount(0);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    refreshStats(); // lần đầu
    const t = setInterval(refreshStats, 15000); // 15 giây
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleNav = (key: string) => {
    setTab(key);
    if (key === "requests") navigate("/company/requests");
    if (key === "home") navigate("/home");
    if (key === "account") navigate ("/company/account");
    if (key === "chat") navigate("/chat");

    // các key khác nếu company chưa dùng thì cứ để sau
  };

  return (
    <AppShell>
      <div className="page">
        {/* Header */}
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="h1" style={{ fontSize: 18 }}>{companyName}</div>
            <div className="status-row">
              <span className={`dot ${isActive ? "dot-on" : "dot-wait"}`} />
              <span className="sub" style={{ marginTop: 0 }}>{statusText}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isActive && (
              <button
                className="dash-bell"
                onClick={refreshStats}
                title="Tải lại"
                aria-label="Tải lại"
                style={{ background: "rgba(44,121,255,0.12)", color: "#2c79ff" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 12a8 8 0 1 1-2.34-5.66"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 4v6h-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <div className="avatar"
              onClick={() => navigate("/company/account")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nếu chưa ACTIVE => chỉ hiện chờ duyệt */}
        {!isActive ? (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="h1" style={{ fontSize: 16 }}>Chờ phê duyệt</div>
            <div className="sub">
              Tài khoản công ty đang ở trạng thái <b>{companyStatus}</b>. Vui lòng chờ Admin kích hoạt để sử dụng đầy đủ chức năng.
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            <div style={{ height: 14 }} />

            {statsError && <div className="authForm-error">{statsError}</div>}

            <div className="card dash">
              <div className="dash-top">
                <div className="dash-left">
                  <div className="sub" style={{ marginTop: 0 }}>Yêu cầu mới (PENDING)</div>
                  <div className="dash-big">{loadingStats ? "…" : pendingCount}</div>
                </div>

                <button className="dash-bell" aria-label="Thông báo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path d="M9.5 20a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <button className="dash-btn" onClick={() => navigate("/company/requests/pending")}>
                Xem ngay
              </button>

              <div className="stat-row">
                <StatCard
                  label="Đang xử lý"
                  value={loadingStats ? 0 : inProgressCount}
                  icon={<span className="miniDot" />}
                  onClick={() => navigate("/company/requests/in-progress")}
                />
                <StatCard
                  label="Hoàn thành hôm nay"
                  value={loadingStats ? 0 : doneTodayCount}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6 9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  onClick={() => navigate("/company/requests/today")}
                />
              </div>
            </div>

            {/* Manage grid */}
            <div style={{ height: 14 }} />
            <div className="h1" style={{ fontSize: 16, marginBottom: 10 }}>
              Quản lý
            </div>

            <div className="tile-grid">
              <ManageTile
                label="Xử lý yêu cầu"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                onClick={() => navigate("/company/requests/in-progress")}
              />

              {/* đổi “Nhắn tin khách hàng” -> “Cập nhật thông tin” */}
              <ManageTile
                label="Cập nhật thông tin"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                onClick={() => navigate("/company/profile")}

              />

              <ManageTile
                label="Đọc phản hồi"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 17.3l-5.4 3 1-6-4.4-4.2 6.1-.9L12 3.7l2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-3Z"
                      fill="currentColor"
                    />
                  </svg>
                }
                onClick={() => navigate("/company/feedback")}
              />

              {/* đổi “Quản lý thông tin” -> “Lịch sử yêu cầu” */}
              <ManageTile
                label="Lịch sử yêu cầu"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 8v5l3 2"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  
                }
                onClick={() => navigate("/company/requests/today")}
              />
            </div>
          </>
        )}
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

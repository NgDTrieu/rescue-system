import { useMemo, useState } from "react";
import AppShell from "./AppShell";
import BottomNav from "./BottomNav";
import "./home.css";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        <div className="stat-ico">{icon}</div>
        <div className="stat-val">{value}</div>
      </div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

function ManageTile({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button className="tile">
      <div className="tile-ico">{icon}</div>
      <div className="tile-lbl">{label}</div>
    </button>
  );
}

export default function CompanyHome() {
  const [tab, setTab] = useState("home");

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const companyName = user?.companyName || "Cứu hộ Minh Tâm";
  const companyStatus = user?.companyStatus || "PENDING"; // mock default

  const isActive = companyStatus === "ACTIVE";

  // mock số liệu
  const newRequests = 8;
  const inProgress = 5;
  const doneToday = 12;

  const statusText = useMemo(() => {
    if (companyStatus === "ACTIVE") return "Đang hoạt động";
    if (companyStatus === "PENDING") return "Chờ admin phê duyệt";
    if (companyStatus === "REJECTED") return "Bị từ chối";
    if (companyStatus === "SUSPENDED") return "Tạm khóa";
    return `Trạng thái: ${companyStatus}`;
  }, [companyStatus]);

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

          <div className="avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Nếu chưa ACTIVE => chỉ hiện màn chờ duyệt */}
        {!isActive ? (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="h1" style={{ fontSize: 16 }}>Chờ phê duyệt</div>
            <div className="sub">
              Tài khoản công ty của bạn đang ở trạng thái <b>{companyStatus}</b>. Vui lòng chờ Admin xét duyệt để sử dụng đầy đủ chức năng.
            </div>

            <div className="pending-box">
              <div className="pending-steps">
                <div className="pending-step">
                  <div className="pending-num">1</div>
                  <div>
                    <div className="pending-title">Hoàn thiện thông tin</div>
                    <div className="pending-desc">Đảm bảo tên công ty, SĐT, email chính xác.</div>
                  </div>
                </div>
                <div className="pending-step">
                  <div className="pending-num">2</div>
                  <div>
                    <div className="pending-title">Admin duyệt</div>
                    <div className="pending-desc">Admin sẽ kiểm tra và kích hoạt tài khoản.</div>
                  </div>
                </div>
                <div className="pending-step">
                  <div className="pending-num">3</div>
                  <div>
                    <div className="pending-title">Bắt đầu nhận yêu cầu</div>
                    <div className="pending-desc">Sau khi ACTIVE, bạn sẽ thấy dashboard và chức năng xử lý.</div>
                  </div>
                </div>
              </div>

              <button className="provider-btn" style={{ width: "100%", marginTop: 12 }}>
                Liên hệ Admin (tạm)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard */}
            <div style={{ height: 14 }} />

            <div className="card dash">
              <div className="dash-top">
                <div className="dash-left">
                  <div className="sub" style={{ marginTop: 0 }}>Yêu cầu mới</div>
                  <div className="dash-big">{newRequests}</div>
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

              <button className="dash-btn">Xem ngay</button>

              <div className="stat-row">
                <StatCard
                  label="Đang xử lý"
                  value={inProgress}
                  icon={<span className="miniDot" />}
                />
                <StatCard
                  label="Hoàn thành hôm nay"
                  value={doneToday}
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
              />
              <ManageTile
                label="Nhắn tin khách hàng"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 15a4 4 0 0 1-4 4H8l-4 3V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
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
              />
              <ManageTile
                label="Quản lý thông tin"
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
              />
            </div>
          </>
        )}
      </div>

      <BottomNav activeKey={tab} onChange={setTab} />
    </AppShell>
  );
}

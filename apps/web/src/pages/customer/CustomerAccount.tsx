import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../home/BottomNav"; // chỉnh path nếu khác
import "./customerAccount.css";

type MeResponse = {
  id: string;
  email: string;
  role: "CUSTOMER" | "COMPANY" | "ADMIN";
  name?: string;
  phone?: string;
  createdAt?: string;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(
    d.getDate()
  )}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function CustomerAccount() {
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);

  async function fetchMe() {
    try {
      setError(null);
      setLoading(true);

      if (!token) {
        setMe(null);
        setError("Bạn chưa đăng nhập.");
        return;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMe(null);
        setError(data?.message || "Không thể tải thông tin tài khoản.");
        return;
      }

      const data = (await res.json()) as MeResponse;
      setMe(data);
    } catch {
      setMe(null);
      setError("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (!token) {
      localStorage.removeItem("accessToken");
      navigate("/auth");
      return;
    }

    try {
      setLoadingLogout(true);
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch(() => null);
    } finally {
      localStorage.removeItem("accessToken");
      setLoadingLogout(false);
      navigate("/auth");
    }
  }

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = me?.name || "Người dùng";
  const initials = (displayName || "U").trim().slice(0, 1).toUpperCase();

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="app-screen">
          <div className="page">
            {/* Top bar */}
            <div className="caTopbar">
              <button className="caIconBtn" onClick={() => navigate(-1)} aria-label="Back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="caTitleWrap">
                <div className="caTitle">Tài khoản</div>
                <div className="caSubtitle">Thông tin cá nhân &amp; đăng xuất</div>
              </div>

              <button
                className="caIconBtn"
                onClick={fetchMe}
                aria-label="Refresh"
                title="Tải lại"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 12a8 8 0 10-2.34 5.66"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 8v4h-4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="caHint">Đang tải…</div>
            ) : error ? (
              <div className="caError">
                <div className="caErrorTitle">Không thể tải dữ liệu</div>
                <div className="caErrorMsg">{error}</div>
                <button className="btnPrimary" onClick={fetchMe}>
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                {/* Card: user */}
                <div className="caCard">
                  <div className="caCardHeader">
                    <div className="caAvatar" aria-hidden="true">
                      {initials}
                    </div>

                    <div className="caCardHeaderText">
                      <div className="caCardTitle">{displayName}</div>
                      <div className="caMuted">{me?.email || "—"}</div>
                    </div>

                    <div className="caPills">
                      <span className="caPill">{me?.role || "—"}</span>
                    </div>
                  </div>

                  <div className="caDivider" />

                  <div className="caRows">
                    <div className="caRow">
                      <div className="caLabel">SĐT</div>
                      <div className="caValue">{me?.phone || "—"}</div>
                    </div>
                    <div className="caRow">
                      <div className="caLabel">Tạo lúc</div>
                      <div className="caValue">{formatDateTime(me?.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* (Optional) Quick actions card */}
                <div className="caCard">
                  <div className="caCardTop">
                    <div>
                      <div className="caCardTitle">Tiện ích</div>
                      <div className="caMuted">Đi nhanh tới các màn chính</div>
                    </div>
                  </div>

                  <div className="caActions caActionsSingleRow">
                    <button className="btnSecondary" onClick={() => navigate("/customer/rescue/new")}>
                      Gửi yêu cầu cứu hộ
                    </button>

                    {/* Bạn đổi route này theo đúng màn “Danh sách yêu cầu” của customer */}
                    <button className="btnPrimary" onClick={() => navigate("/customer/requests")}>
                      Danh sách yêu cầu
                    </button>
                  </div>
                </div>

                {/* Card: session */}
                <div className="caCard">
                  <div className="caCardTop">
                    <div>
                      <div className="caCardTitle">Phiên đăng nhập</div>
                      <div className="caMuted">Đăng xuất sẽ xóa accessToken khỏi trình duyệt.</div>
                    </div>
                  </div>

                  <button
                    className="caBtnDanger"
                    onClick={handleLogout}
                    disabled={loadingLogout}
                  >
                    {loadingLogout ? "Đang đăng xuất…" : "Đăng xuất"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom nav (customer) */}
          <BottomNav
            activeKey="account"
            onChange={(key) => {
              if (key === "home") navigate("/home");
              else if (key === "requests") navigate("/customer/requests"); // đổi đúng route của bạn
              else if (key === "chat") navigate("/customer/community"); // nếu chưa có thì bạn đổi sau
              else navigate("/customer/account");
            }}
          />
        </div>
      </div>
    </div>
  );
}

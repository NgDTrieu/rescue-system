import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type CompanyRequest = {
  id: string;
  status: "COMPLETED";
  issueType: string;
  note?: string;
  contactName: string;
  contactPhone: string;
  addressText?: string;
  location: { lat: number; lng: number };
  quotedBasePrice: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
};

type ListResp = {
  status: string;
  count: number;
  items: CompanyRequest[];
};

function isTodayLocal(iso?: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function CompanyRequestsToday() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const [items, setItems] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/company/requests?status=COMPLETED`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = (await res.json()) as ListResp;
      if (!res.ok) throw new Error((data as any).message || "Không tải được danh sách COMPLETED");

      // Lọc “hôm nay”: ưu tiên completedAt, fallback updatedAt/createdAt
      const all = data.items || [];

      all.sort((a, b) => {
        const ta = new Date(a.completedAt ?? a.updatedAt ?? a.createdAt).getTime();
        const tb = new Date(b.completedAt ?? b.updatedAt ?? b.createdAt).getTime();
        return tb - ta;
      });

      setItems(all);

    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // BottomNav dùng chung => điều hướng theo role tại màn
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/company/requests");
  };

  return (
    <AppShell>
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="authForm-back" onClick={() => navigate(-1)} aria-label="Quay lại">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={{ flex: 1 }}>
            <div className="h1" style={{ fontSize: 18 }}>Hoàn thành hôm nay</div>
            <div className="sub" style={{ marginTop: 4 }}>
              Trạng thái: <b>COMPLETED</b>
            </div>
          </div>

          <button className="dash-bell" onClick={load} aria-label="Tải lại" title="Tải lại">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        <div className="card">
          <div className="sub" style={{ marginTop: 0 }}>
            {loading ? "Đang tải..." : `Hôm nay có ${items.length} yêu cầu COMPLETED`}
          </div>

          <div style={{ height: 10 }} />

          {!loading && items.length === 0 && !error && (
            <div className="sub">Hôm nay chưa có yêu cầu nào hoàn thành.</div>
          )}

          <div className="companyList">
            {items.map((r) => (
              <button
                key={r.id}
                className="companyCard"
                onClick={() => navigate(`/company/requests/${r.id}`)}
              >
                <div className="companyTop">
                  <div className="companyName">{r.issueType}</div>
                  <div className="companyDist">COMPLETED</div>
                </div>

                <div className="companyMeta">
                  <span>👤 {r.contactName}</span>
                  <span>📞 {r.contactPhone}</span>
                </div>

                <div className="companyMeta" style={{ marginTop: 6 }}>
                  <span>📍 {r.addressText || `${r.location.lat}, ${r.location.lng}`}</span>
                  <span>Giá: <b>{formatMoney(r.quotedBasePrice)}</b></span>
                </div>

                <div className="sub" style={{ marginTop: 8 }}>
                  Hoàn thành:{" "}
                  {new Date(r.completedAt ?? r.updatedAt ?? r.createdAt).toLocaleString("vi-VN")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

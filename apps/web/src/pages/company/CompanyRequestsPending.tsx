import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type CompanyRequest = {
  id: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  issueType: string;
  note?: string;
  contactName: string;
  contactPhone: string;
  addressText?: string;
  location: { lat: number; lng: number };
  quotedBasePrice: number;
  createdAt: string;
};

type ListResp = {
  status: string;
  count: number;
  items: CompanyRequest[];
};

export default function CompanyRequestsPending() {
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
      const res = await fetch(`${API}/company/requests?status=PENDING`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách yêu cầu");
      const payload = data as ListResp;
      setItems(payload.items || []);
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

  return (
    <AppShell>
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="authForm-back" onClick={() => navigate(-1)} aria-label="Quay lại">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <div className="h1" style={{ fontSize: 18 }}>Yêu cầu mới</div>
            <div className="sub" style={{ marginTop: 4 }}>Trạng thái: <b>PENDING</b></div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div className="sub" style={{ marginTop: 0 }}>
              {loading ? "Đang tải..." : `Có ${items.length} yêu cầu`}
            </div>
            <button className="dash-bell" onClick={load} aria-label="Tải lại" title="Tải lại">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div style={{ height: 10 }} />

          {(!loading && items.length === 0 && !error) && (
            <div className="sub">Chưa có yêu cầu mới.</div>
          )}

          <div className="companyList">
            {items.map((r) => (
              <button
                key={r.id}
                className="companyCard"
                onClick={() => navigate(`/company/requests/${r.id}`, { state: { req: r } })}
              >
                <div className="companyTop">
                  <div className="companyName">{r.issueType}</div>
                  <div className="companyDist">PENDING</div>
                </div>

                <div className="companyMeta">
                  <span>👤 {r.contactName}</span>
                  <span>📞 {r.contactPhone}</span>
                </div>

                <div className="companyMeta" style={{ marginTop: 6 }}>
                  <span>📍 {r.addressText || `${r.location.lat}, ${r.location.lng}`}</span>
                  <span>Giá gốc: <b>{formatMoney(r.quotedBasePrice)}</b></span>
                </div>

                {r.note ? (
                  <div className="sub" style={{ marginTop: 8 }}>
                    Ghi chú: {r.note}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={setTab} />
    </AppShell>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type Status = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type RequestItem = {
  id: string;
  status: Status;
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
  cancelledAt?: string | null;
};

type ListResp = {
  status: Status;
  count: number;
  items: RequestItem[];
};

export default function CompanyRequestsAll() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests"); // đang ở tab yêu cầu

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const fetchByStatus = async (status: Status) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API}/company/requests?status=${status}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Không tải được ${status}`);
    return data as ListResp;
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const statuses: Status[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
      const results = await Promise.all(statuses.map(fetchByStatus));

      const merged = results.flatMap((r) => r.items || []);

      merged.sort((a, b) => {
        const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
        const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
        return tb - ta;
      });

      setItems(merged);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // polling nhẹ (vì bạn bỏ realtime)
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filter === "ALL" ? items : items.filter((x) => x.status === filter);

  // 🔒 BottomNav dùng chung => xử lý điều hướng ngay tại đây cho company
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/company/requests");
    if (key === "chat") navigate("/chat");

    if (key === "account") navigate ("/company/account");
  };

  return (
    <AppShell>
      <div className="page">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="authForm-back" onClick={() => navigate(-1)} aria-label="Quay lại">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ flex: 1 }}>
            <div className="h1" style={{ fontSize: 18 }}>Danh sách yêu cầu</div>
            <div className="sub" style={{ marginTop: 4 }}>
              Tất cả trạng thái
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
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <div className="sub" style={{ marginTop: 0 }}>
              {loading ? "Đang tải..." : `Có ${filtered.length} yêu cầu`}
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="statusSelect"
              aria-label="Lọc trạng thái"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div style={{ height: 10 }} />

          {!loading && filtered.length === 0 && !error && (
            <div className="sub">Chưa có yêu cầu nào.</div>
          )}

          <div className="companyList">
            {filtered.map((r) => (
              <button
                key={r.id}
                className="companyCard"
                onClick={() => navigate(`/company/requests/${r.id}`)}
              >
                <div className="companyTop">
                  <div className="companyName">{r.issueType}</div>
                  <div className="companyDist">{r.status}</div>
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
                  Tạo lúc: {new Date(r.createdAt).toLocaleString("vi-VN")}
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

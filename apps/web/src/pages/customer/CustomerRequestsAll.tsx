import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type Status = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type RequestItem = {
  id: string;
  status: Status;
  categoryId?: string;
  assignedCompanyId?: string;
  quotedBasePrice: number;
  etaMinutes?: number | null;
  issueType: string;
  addressText?: string;
  createdAt: string;
};

type ListRespA = { count: number; items: RequestItem[] }; // dạng trong docs /requests/my
type ListRespB = { status: Status; count: number; items: RequestItem[] }; // phòng khi backend trả kèm status

export default function CustomerRequestsAll() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests");

  const API = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:4000",
    []
  );

  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const authHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // 1) ưu tiên gọi 1 phát "ALL" (không truyền status)
  // 2) nếu backend không hỗ trợ, fallback gọi theo từng status rồi merge
  const fetchAllOnce = async () => {
    const res = await fetch(`${API}/requests/my`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Không tải được danh sách yêu cầu");
    const parsed = data as ListRespA | ListRespB;
    return parsed.items || [];
  };

  const fetchByStatus = async (status: Status) => {
    const res = await fetch(`${API}/requests/my?status=${status}`, {
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Không tải được ${status}`);
    const parsed = data as ListRespA | ListRespB;
    return parsed.items || [];
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const list = await fetchAllOnce();
      const sorted = [...list].sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      });
      setItems(sorted);
    } catch (e: any) {
      // fallback: merge 5 status
      try {
        const statuses: Status[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
        const results = await Promise.all(statuses.map(fetchByStatus));
        const merged = results.flat();

        merged.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return tb - ta;
        });

        setItems(merged);
      } catch (e2: any) {
        const msg = e2?.message || e?.message || "Có lỗi xảy ra";
        setError(msg);

        // nếu token hết hạn => đá về login cho nhanh
        if (String(msg).toLowerCase().includes("unauthorized")) {
          localStorage.removeItem("accessToken");
          navigate("/auth/login");
        }

        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filter === "ALL" ? items : items.filter((x) => x.status === filter);

  // BottomNav dùng chung => mapping riêng cho CUSTOMER ngay tại màn này
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account"); // bạn tạo sau
  };

  const statusLabel = (s: Status) => {
    switch (s) {
      case "PENDING":
        return "Đang chờ";
      case "ASSIGNED":
        return "Đã nhận";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã huỷ";
      default:
        return s;
    }
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
            <div className="h1" style={{ fontSize: 18 }}>
              Danh sách yêu cầu
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              Tất cả trạng thái
            </div>
          </div>

          <button className="dash-bell" onClick={load} aria-label="Tải lại" title="Tải lại">
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
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        <div className="card">
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
                onClick={() => navigate(`/customer/requests/${r.id}`)} // bạn làm detail sau
              >
                <div className="companyTop">
                  <div className="companyName">{r.issueType}</div>
                  <div className="companyDist">{statusLabel(r.status)}</div>
                </div>

                <div className="companyMeta">
                  <span>📍 {r.addressText || "Chưa có địa chỉ"}</span>
                  <span>
                    Giá: <b>{formatMoney(r.quotedBasePrice)}</b>
                  </span>
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

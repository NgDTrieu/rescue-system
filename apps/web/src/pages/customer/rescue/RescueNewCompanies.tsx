import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../../home/AppShell";
import BottomNav from "../../home/BottomNav";
import "../../home/home.css";

type Category = {
  id: string;
  key: string;
  name: string;
  description?: string;
};

type CompanySuggest = {
  id: string;
  companyName: string;
  phone: string;
  distanceKm: number;
  basePrice: number;
  location: { lat: number; lng: number };
};

export default function RescueNewCompanies() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  const category: Category | undefined = (loc.state as any)?.category;
  const locationState = (loc.state as any)?.location as { lat: number; lng: number } | undefined;
  const addressText: string = (loc.state as any)?.addressText || "";

  // fallback nếu refresh mất state
  useEffect(() => {
    if (!category || !locationState) {
      navigate("/customer/rescue/new", { replace: true });
    }
  }, [category, locationState, navigate]);

  const [radiusKm, setRadiusKm] = useState(10);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState<CompanySuggest[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);

  const fetchSuggest = async () => {
    if (!category || !locationState) return;

    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        categoryId: category.id,
        lat: String(locationState.lat),
        lng: String(locationState.lng),
        radiusKm: String(radiusKm),
        limit: String(limit),
      });

      const res = await fetch(`${API}/companies/suggest?${qs.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không lấy được danh sách công ty");
      }

      setItems(data.items || []);
      if ((data.items || []).length > 0) setSelectedId(data.items[0].id);
    } catch (e: any) {
      setError(e.message || "Lỗi gọi companies/suggest");
      setItems([]);
      setSelectedId("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggest();
  }, []);

  const selectedCompany = items.find((x) => x.id === selectedId);

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account");
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
          <div>
            <div className="h1" style={{ fontSize: 18 }}>Chọn đơn vị cứu hộ</div>
            <div className="sub" style={{ marginTop: 4 }}>
              Dịch vụ: <b>{category?.name}</b>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div className="sub" style={{ marginTop: 0 }}>
            Vị trí: <b>{locationState?.lat}</b>, <b>{locationState?.lng}</b>
            {addressText ? <> • <span>{addressText}</span></> : null}
          </div>

          {/* SỬA TẠI ĐÂY: Thêm label rõ ràng cho bộ lọc */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Bán kính (km)</label>
              <input
                className="authForm-input"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value || 10))}
                placeholder="Ví dụ: 10"
                type="number"
                min={1}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Số kết quả</label>
              <input
                className="authForm-input"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value || 10))}
                placeholder="Ví dụ: 10"
                type="number"
                min={1}
                max={50}
              />
            </div>
          </div>

          <button className="provider-btn" style={{ width: "100%" }} onClick={fetchSuggest} disabled={loading}>
            {loading ? "Đang tải..." : "Cập nhật danh sách"}
          </button>
        </div>

        <div style={{ height: 12 }} />

        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>Gợi ý gần bạn</div>
          <div className="sub">Bán kính tìm kiếm hiện tại: <b>{radiusKm}km</b></div>

          <div style={{ height: 10 }} />

          {loading && <div className="sub">Đang tải danh sách...</div>}

          {!loading && items.length === 0 && !error && (
            <div className="sub">Không tìm thấy công ty nào trong phạm vi {radiusKm}km. Hãy thử tăng bán kính.</div>
          )}

          <div className="companyList">
            {items.map((c) => {
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  className={`companyCard ${active ? "is-active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="companyTop">
                    <div className="companyName">{c.companyName}</div>
                    <div className="companyDist">{c.distanceKm.toFixed(2)} km</div>
                  </div>
                  <div className="companyMeta">
                    <span>📞 {c.phone}</span>
                    <span>Giá gốc: <b>{formatMoney(c.basePrice)}</b></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 12 }} />

        <button
          className="provider-btn"
          style={{ width: "100%", opacity: selectedCompany ? 1 : 0.55 }}
          disabled={!selectedCompany}
          onClick={() => {
            navigate("/customer/rescue/new/confirm", {
              state: {
                category,
                location: locationState,
                addressText,
                company: selectedCompany,
              },
            });
          }}
        >
          Tiếp tục: Xác nhận yêu cầu
        </button>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}
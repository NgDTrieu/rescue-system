import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type Category = {
  id: string;
  key: string;
  name: string;
  description?: string;
};

type CategoriesResp = {
  count: number;
  items: Category[];
};

type ServicePick = {
  categoryId: string;
  basePrice: number; // VND
};

export default function CompanyUpdateProfile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);

  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // map: categoryId -> basePrice string (để input dễ)
  const [selected, setSelected] = useState<Record<string, string>>({});

  const fetchCategories = async () => {
    setLoadingCats(true);
    setError("");
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được danh sách dịch vụ");
      const resp = data as CategoriesResp;
      setCategories(resp.items || []);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleService = (categoryId: string) => {
    setSuccess("");
    setSelected((prev) => {
      const next = { ...prev };
      if (next[categoryId] !== undefined) {
        delete next[categoryId];
      } else {
        next[categoryId] = "80000"; // default gợi ý
      }
      return next;
    });
  };

  const setPrice = (categoryId: string, value: string) => {
    setSuccess("");
    setSelected((prev) => ({ ...prev, [categoryId]: value }));
  };

  const useMyLocation = () => {
    setSuccess("");
    setError("");
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ lấy vị trí.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => setError("Không lấy được vị trí. Hãy cấp quyền Location hoặc nhập tay lat/lng."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const buildPayload = (): { lat: number; lng: number; services: ServicePick[] } => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const services: ServicePick[] = Object.entries(selected).map(([categoryId, priceStr]) => ({
      categoryId,
      basePrice: Number(priceStr),
    }));
    return { lat: latNum, lng: lngNum, services };
  };

  const validate = (): string | null => {
    if (!lat || !lng) return "Vui lòng nhập lat/lng hoặc bấm 'Lấy vị trí hiện tại'.";
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return "Lat/Lng phải là số.";
    if (latNum < -90 || latNum > 90) return "Lat không hợp lệ.";
    if (lngNum < -180 || lngNum > 180) return "Lng không hợp lệ.";

    const serviceIds = Object.keys(selected);
    if (serviceIds.length === 0) return "Vui lòng chọn ít nhất 1 dịch vụ.";

    for (const [id, priceStr] of Object.entries(selected)) {
      const price = Number(priceStr);
      if (!priceStr || Number.isNaN(price) || price <= 0) {
        const name = categories.find((c) => c.id === id)?.name || "dịch vụ";
        return `Giá của "${name}" không hợp lệ.`;
      }
    }
    return null;
  };

  const submit = async () => {
    setSuccess("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = buildPayload();

      const res = await fetch(`${API}/company/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      setSuccess("Cập nhật thông tin thành công ✅");
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // BottomNav dùng chung => điều hướng theo role tại màn
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/company/requests");
    if (key === "account") navigate ("/company/account");
    if (key === "chat") navigate("/chat");

  };

  return (
    <AppShell>
      <div className="page">
        {/* Header */}
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
            <div className="h1" style={{ fontSize: 18 }}>Cập nhật thông tin</div>
            <div className="sub" style={{ marginTop: 4 }}>Vị trí + dịch vụ + giá</div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}
        {success && <div className="authForm-success">{success}</div>}

        {/* Location */}
        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>Vị trí công ty</div>
          <div className="sub">Nhập lat/lng hoặc dùng vị trí hiện tại (trình duyệt).</div>

          <div style={{ height: 10 }} />

          <div className="grid2">
            <div>
              <div className="label">Lat</div>
              <input
                className="input"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="VD: 21.028"
                inputMode="decimal"
              />
            </div>
            <div>
              <div className="label">Lng</div>
              <input
                className="input"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="VD: 105.834"
                inputMode="decimal"
              />
            </div>
          </div>

          <div style={{ height: 10 }} />

          <button className="btnSecondary" onClick={useMyLocation} type="button">
            Lấy vị trí hiện tại
          </button>
        </div>

        <div style={{ height: 12 }} />

        {/* Services */}
        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>Dịch vụ & giá</div>
          <div className="sub">Chọn dịch vụ công ty có thể hỗ trợ và nhập giá cơ bản (VND).</div>

          <div style={{ height: 10 }} />

          {loadingCats ? (
            <div className="sub">Đang tải danh sách dịch vụ...</div>
          ) : (
            <div className="serviceList">
              {categories.map((c) => {
                const isOn = selected[c.id] !== undefined;
                return (
                  <div key={c.id} className={`serviceRow ${isOn ? "on" : ""}`}>
                    <label className="serviceLeft">
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => toggleService(c.id)}
                      />
                      <div>
                        <div className="serviceName">{c.name}</div>
                        {c.description && <div className="sub">{c.description}</div>}
                      </div>
                    </label>

                    <div className="serviceRight">
                      <input
                        className="priceInput"
                        disabled={!isOn}
                        value={selected[c.id] ?? ""}
                        onChange={(e) => setPrice(c.id, e.target.value)}
                        placeholder="Giá (VND)"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spacer để tránh bị che bởi nút submit */}
        <div style={{ height: 88 }} />

        {/* Fixed submit */}
        <div className="fixedAction">
          <button className="btnPrimary" onClick={submit} disabled={loading}>
            {loading ? "Đang cập nhật..." : "Lưu thông tin"}
          </button>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

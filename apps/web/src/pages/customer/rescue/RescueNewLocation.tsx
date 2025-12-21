import { useMemo, useState } from "react";
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

export default function RescueNewLocation() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  const category: Category | undefined = (loc.state as any)?.category;

  // Nếu user refresh page mất state -> quay lại chọn category
  if (!category) {
    navigate("/customer/rescue/new", { replace: true });
  }

  // Chuyển sang dùng string để nhập liệu dấu thập phân không bị lỗi
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [addressText, setAddressText] = useState("");
  const [getting, setGetting] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra xem chuỗi nhập vào có phải là số hợp lệ không
  const canNext = useMemo(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return (
      !isNaN(latNum) && 
      !isNaN(lngNum) && 
      lat.trim() !== "" && 
      lng.trim() !== ""
    );
  }, [lat, lng]);

  const getCurrentLocation = () => {
    setError("");
    setGetting(true);

    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị. Vui lòng nhập tay lat/lng.");
      setGetting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLng(String(pos.coords.longitude.toFixed(6)));
        setGetting(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại hoặc nhập tay."
            : "Không lấy được vị trí. Hãy thử lại hoặc nhập tay."
        );
        setGetting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
            <div className="h1" style={{ fontSize: 18 }}>Vị trí của bạn</div>
            <div className="sub" style={{ marginTop: 4 }}>
              Dịch vụ: <b>{category?.name}</b>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        <div className="card">
          <div className="sub" style={{ marginTop: 0 }}>
            Gợi ý: trước mắt dùng “Vị trí hiện tại” hoặc nhập tay lat/lng.
          </div>

          <div style={{ height: 12 }} />

          <button
            className="provider-btn"
            style={{ width: "100%" }}
            onClick={getCurrentLocation}
            disabled={getting}
          >
            {getting ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
          </button>

          <div style={{ height: 14 }} />

          <div className="sub" style={{ marginTop: 0, fontWeight: 850 }}>Hoặc nhập tay</div>
          <div style={{ height: 8 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="authForm-input"
              type="text"
              inputMode="decimal"
              placeholder="lat (vd 21.028)"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              className="authForm-input"
              type="text"
              inputMode="decimal"
              placeholder="lng (vd 105.834)"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>

          <div style={{ height: 10 }} />

          <input
            className="authForm-input"
            placeholder="Gợi ý: nhập địa chỉ (không bắt buộc)"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
          />

          <div style={{ height: 14 }} />

          <button
            className="provider-btn"
            style={{ width: "100%", opacity: canNext ? 1 : 0.55 }}
            disabled={!canNext}
            onClick={() => {
              // Parse chuỗi sang số trước khi gửi đi
              navigate("/customer/rescue/new/companies", {
                state: {
                  category,
                  location: { 
                    lat: parseFloat(lat), 
                    lng: parseFloat(lng) 
                  },
                  addressText,
                },
              });
            }}
          >
            Tiếp tục: Gợi ý công ty
          </button>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}
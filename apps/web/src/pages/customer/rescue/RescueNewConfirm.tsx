import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../../home/AppShell";
import BottomNav from "../../home/BottomNav";
import "../../home/home.css";

type Category = { id: string; name: string };
type CompanySuggest = {
  id: string;
  companyName: string;
  phone: string;
  distanceKm: number;
  basePrice: number;
  location: { lat: number; lng: number };
};

export default function RescueNewConfirm() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  const category: Category | undefined = (loc.state as any)?.category;
  const company: CompanySuggest | undefined = (loc.state as any)?.company;
  const locationState = (loc.state as any)?.location as { lat: number; lng: number } | undefined;
  const addressText: string = (loc.state as any)?.addressText || "";

  useEffect(() => {
    if (!category || !company || !locationState) {
      navigate("/customer/rescue/new", { replace: true });
    }
  }, [category, company, locationState, navigate]);

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const [issueType, setIssueType] = useState("");
  const [note, setNote] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const canSubmit =
    issueType.trim().length > 0 &&
    contactName.trim().length > 0 &&
    contactPhone.trim().length > 0 &&
    !!category?.id &&
    !!company?.id &&
    typeof locationState?.lat === "number" &&
    typeof locationState?.lng === "number";

  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập (thiếu accessToken).");

      const body = {
        categoryId: category!.id,
        companyId: company!.id,
        issueType: issueType.trim(),
        note: note.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        lat: locationState!.lat,
        lng: locationState!.lng,
        addressText: addressText || "",
      };

      const res = await fetch(`${API}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // 400/401/403 đều {message}
        throw new Error(data.message || "Gửi yêu cầu thất bại");
      }

      // 201 created
      navigate("/customer/rescue/new/success", { state: { request: data } });
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

    // BottomNav dùng chung => mapping riêng cho CUSTOMER ngay tại màn này
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account"); // bạn tạo sau
    if (key === "chat") navigate("/chat");

  };

  return (
    <AppShell>
      <div className="page">
        {/* Top */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="authForm-back" onClick={() => navigate(-1)} aria-label="Quay lại">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <div className="h1" style={{ fontSize: 18 }}>Xác nhận yêu cầu</div>
            <div className="sub" style={{ marginTop: 4 }}>Kiểm tra thông tin trước khi gửi.</div>
          </div>
        </div>

        <div style={{ height: 12 }} />
        {error && <div className="authForm-error">{error}</div>}

        {/* Summary */}
        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>Tóm tắt</div>
          <div style={{ height: 10 }} />

          <div className="sumRow">
            <div className="sumKey">Dịch vụ</div>
            <div className="sumVal">{category?.name}</div>
          </div>

          <div className="sumRow">
            <div className="sumKey">Công ty</div>
            <div className="sumVal">{company?.companyName}</div>
          </div>

          <div className="sumRow">
            <div className="sumKey">SĐT công ty</div>
            <div className="sumVal">{company?.phone}</div>
          </div>

          <div className="sumRow">
            <div className="sumKey">Khoảng cách</div>
            <div className="sumVal">{company ? `${company.distanceKm.toFixed(2)} km` : ""}</div>
          </div>

          <div className="sumRow">
            <div className="sumKey">Giá gốc</div>
            <div className="sumVal">{company ? formatMoney(company.basePrice) : ""}</div>
          </div>

          <div className="sumRow">
            <div className="sumKey">Vị trí</div>
            <div className="sumVal">
              {locationState?.lat}, {locationState?.lng}
            </div>
          </div>

          <div className="sumRow">
            <div className="sumKey">Địa chỉ</div>
            <div className="sumVal">{addressText || "(chưa nhập)"}</div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {/* Form */}
        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>Thông tin sự cố</div>
          <div style={{ height: 10 }} />

          <div className="sub" style={{ marginTop: 0, fontWeight: 850 }}>Vấn đề</div>
          <input
            className="authForm-input"
            placeholder='VD: "Hết xăng"'
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          />

          <div style={{ height: 10 }} />
          <div className="sub" style={{ marginTop: 0, fontWeight: 850 }}>Ghi chú</div>
          <textarea
            className="authForm-input"
            style={{ height: 92, resize: "none", paddingTop: 10 }}
            placeholder='VD: "Xe máy hết xăng, cần hỗ trợ"'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div style={{ height: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div className="sub" style={{ marginTop: 0, fontWeight: 850 }}>Tên liên hệ</div>
              <input
                className="authForm-input"
                placeholder="Tên của bạn"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div>
              <div className="sub" style={{ marginTop: 0, fontWeight: 850 }}>SĐT liên hệ</div>
              <input
                className="authForm-input"
                placeholder="0900..."
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <button
            className="provider-btn"
            style={{ width: "100%", opacity: canSubmit ? 1 : 0.55 }}
            disabled={!canSubmit || loading}
            onClick={submit}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu cứu hộ"}
          </button>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

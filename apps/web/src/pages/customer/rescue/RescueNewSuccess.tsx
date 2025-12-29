import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../../home/AppShell";
import BottomNav from "../../home/BottomNav";
import "../../home/home.css";
import { useState } from "react";

export default function RescueNewSuccess() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  const request = (loc.state as any)?.request;

  // BottomNav dùng chung => mapping riêng cho CUSTOMER ngay tại màn này
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account"); // bạn tạo sau
  };

  return (
    <AppShell>
      <div className="page">
        <div className="card" style={{ display: "grid", gap: 10, textAlign: "center" }}>
          <div style={{ fontSize: 44 }}>✅</div>
          <div className="h1">Tạo yêu cầu thành công</div>
          <div className="sub">
            Trạng thái: <b>{request?.status || "PENDING"}</b>
          </div>

          {request?.id && (
            <div className="sub">
              Mã yêu cầu: <b>{request.id}</b>
            </div>
          )}

          <button className="provider-btn" style={{ width: "100%" }} onClick={() => navigate("/home")}>
            Về trang chủ
          </button>

          <button
            className="provider-btn"
            style={{ width: "100%", background: "#fff", color: "#2c79ff", border: "2px solid rgba(44,121,255,0.35)" }}
            onClick={() => navigate("/customer/rescue/new")}
          >
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

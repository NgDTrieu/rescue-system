import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../home/home.css"; // dùng chung AppShell style
import AppShell from "../../home/AppShell";
import BottomNav from "../../home/BottomNav";

type Category = {
  id: string;
  key: string;
  name: string;
  description?: string;
};

export default function RescueNewSelectCategory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  // tạm mock trước (Bước 2 mình sẽ gọi API /categories thật)
  const [items, setItems] = useState<Category[]>([
    { id: "mock1", key: "FUEL", name: "Cứu hộ hết xăng", description: "Tiếp nhiên liệu tại chỗ" },
    { id: "mock2", key: "TIRE", name: "Thủng lốp", description: "Vá / thay lốp" },
    { id: "mock3", key: "BATTERY", name: "Hết ắc quy", description: "Kích bình / thay" },
    { id: "mock4", key: "TOW", name: "Kéo xe", description: "Cứu hộ kéo xe" },
  ]);

  useEffect(() => {
    // Bước 2: sẽ thay mock bằng fetch GET /categories
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
          <div className="h1" style={{ fontSize: 18 }}>Chọn dịch vụ cứu hộ</div>
        </div>

        <div style={{ height: 12 }} />

        <div className="card">
          <div className="sub" style={{ marginTop: 0 }}>
            Chọn vấn đề bạn đang gặp để hệ thống gợi ý công ty phù hợp.
          </div>

          <div style={{ height: 12 }} />

          <div className="tile-grid">
            {items.map((c) => (
              <button
                key={c.id}
                className="tile"
                onClick={() => {
                  // Bước 3: chuyển sang màn nhập vị trí + truyền categoryId
                  navigate("/customer/rescue/new/location", { state: { category: c } });
                }}
              >
                <div className="tile-ico">⚡</div>
                <div className="tile-lbl">{c.name}</div>
                <div className="sub" style={{ marginTop: 0 }}>{c.description || ""}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={setTab} />
    </AppShell>
  );
}

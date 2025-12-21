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

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const res = await fetch(`${API}/categories`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Không tải được danh sách dịch vụ");

        // theo ảnh swagger: { count, items: [...] }
        setItems(data.items || []);
      } catch (e: any) {
        setError(e.message || "Lỗi tải categories");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

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
          {loading && <div className="sub">Đang tải dịch vụ...</div>}
          {error && <div className="authForm-error">{error}</div>}
          {!loading && !error && (
            <div className="tile-grid">
              {items.map((c) => (
                <button
                  key={c.id}
                  className="tile"
                  onClick={() => navigate("/customer/rescue/new/location", { state: { category: c } })}
                >
                  <div className="tile-ico">⚡</div>
                  <div className="tile-lbl">{c.name}</div>
                  <div className="sub" style={{ marginTop: 0 }}>{c.description || ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

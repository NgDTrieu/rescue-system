import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../home/home.css";
import "./communityCreate.css"; // Import file css mới
import BottomNav from "../home/BottomNav"; 

const API_URL = import.meta.env.VITE_API_URL;

export default function CustomerCommunityTipCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState("home");

  const getToken = () => localStorage.getItem("accessToken") || "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !solution.trim()) {
      setErr("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/community/tips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title: title.trim(), solution: solution.trim() }),
      });

      if (!res.ok) throw new Error("Tạo tư vấn thất bại.");
      setMsg("Đã đăng tư vấn thành công!");
      setTimeout(() => navigate("/customer/community"), 800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

    // BottomNav dùng chung => mapping riêng cho CUSTOMER ngay tại màn này
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account"); // bạn tạo sau
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="app-screen">
          {/* Header kế thừa từ màn History của bạn */}
          <div className="phoneHeader">
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
            <div className="headerText">
              <div className="pageTitle">Thêm tư vấn</div>
              <div className="pageSubtitle">Chia sẻ mẹo hay cho cộng đồng</div>
            </div>
          </div>

          <div className="page create-container">
            <div className="form-card">
              {msg && <div className="alert alert-success">{msg}</div>}
              {err && <div className="alert alert-error">{err}</div>}

              <form onSubmit={onSubmit}>
                <div className="input-group">
                  <label className="input-label">Tiêu đề tư vấn</label>
                  <input
                    className="custom-input"
                    placeholder="VD: Xe hết xăng giữa đường"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Cách xử lý / Giải pháp</label>
                  <textarea
                    className="custom-textarea"
                    placeholder="Mô tả chi tiết các bước xử lý..."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="action-stack">
                  <button 
                    className="submit-btn" 
                    disabled={loading} 
                    type="submit"
                  >
                    {loading ? "Đang xử lý..." : "Đăng tư vấn ngay"}
                  </button>
                  <button
                    className="cancel-btn"
                    type="button"
                    onClick={() => navigate("/customer/community")}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>

          <BottomNav activeKey={tab} onChange={handleNav} />
        </div>
      </div>
    </div>
  );
}
// apps/web/src/pages/auth/Register.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authWelcome.css";
import "./authForms.css";

type Role = "CUSTOMER" | "COMPANY";

export default function Register() {
  const navigate = useNavigate();

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CUSTOMER" as Role,
    companyName: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      // validate nhanh (để tránh gọi API vô ích)
      if (!formData.name.trim()) throw new Error("Vui lòng nhập họ tên.");
      if (!formData.email.trim()) throw new Error("Vui lòng nhập email.");
      if (!formData.password.trim()) throw new Error("Vui lòng nhập mật khẩu.");
      if (formData.role === "COMPANY" && !formData.companyName.trim()) {
        throw new Error("Vui lòng nhập tên đơn vị cứu hộ.");
      }

      const payload = {
        ...formData,
        companyName: formData.role === "COMPANY" ? formData.companyName : "",
      };

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">
        {/* Nền đồng nhất với AuthWelcome */}
        <div className="aw2 authForm">
          <div className="aw2-bg" aria-hidden="true" />
          <div className="aw2-triangles" aria-hidden="true" />
          <div className="aw2-sparkle" aria-hidden="true" />

          {/* Layout cột: Topbar -> Card (scroll) -> Actions (fixed bottom) */}
          <div
            className="authForm-content"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top bar */}
            <div className="authForm-topbar">
              <button className="authForm-back" onClick={() => navigate("/auth")} aria-label="Quay lại">
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
              <div className="authForm-topTitle">Đăng ký</div>
            </div>

            {error && <div className="authForm-error">{error}</div>}

            {/* Card trắng chỉ chứa fields + scroll */}
            <div
              className="authForm-card"
              style={{
                flex: "1 1 auto",
                overflow: "auto",
              }}
            >
              <div className="authForm-fields">
                <div>
                  <div className="authForm-label">Họ tên</div>
                  <input
                    className="authForm-input"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="authForm-label">Email</div>
                  <input
                    className="authForm-input"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="authForm-label">Mật khẩu</div>
                  <input
                    className="authForm-input"
                    name="password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="authForm-label">Số điện thoại</div>
                  <input
                    className="authForm-input"
                    name="phone"
                    placeholder="0912..."
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="authForm-label">Bạn là?</div>
                  <select className="authForm-select" name="role" value={formData.role} onChange={handleChange}>
                    <option value="CUSTOMER">Người cần cứu hộ (Khách hàng)</option>
                    <option value="COMPANY">Đơn vị cứu hộ (Công ty)</option>
                  </select>
                </div>

                {formData.role === "COMPANY" && (
                  <div>
                    <div className="authForm-label">Tên đơn vị cứu hộ</div>
                    <input
                      className="authForm-input"
                      name="companyName"
                      placeholder="VD: Cứu hộ Ba Đình"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(7,22,55,0.55)" }}>
                  {formData.role === "COMPANY"
                    ? "Lưu ý: tài khoản Công ty có thể cần Admin duyệt để dùng đầy đủ tính năng."
                    : " "}
                </div>
              </div>
            </div>

            {/* Actions: nằm ngoài khung trắng, cố định gần cuối, không cuộn */}
            <div style={{ flex: "0 0 auto", paddingTop: 12 }}>
              <div className="authForm-actions">
                <button className="authForm-btn authForm-btnPrimary" onClick={handleRegister} disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                </button>

                <button
                  className="authForm-btn authForm-btnGhost"
                  onClick={() => navigate("/auth/login")}
                  disabled={loading}
                >
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

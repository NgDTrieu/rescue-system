import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authWelcome.css";
import "./authForms.css";

// ✅ socket: gọi connect sau khi login thành công
import { connectSocket } from "../../services/socket";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // lưu token như bạn đang làm
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ connect socket ngay sau khi có accessToken
      // connectSocket(data.accessToken);

      // logic companyStatus bạn đã có
      if (data.user.role === "COMPANY" && data.user.companyStatus !== "ACTIVE") {
        alert(
          `Tài khoản công ty đang ở trạng thái: ${data.user.companyStatus}. Một số tính năng sẽ bị hạn chế cho đến khi Admin duyệt.`
        );
      }

      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">
        {/* dùng nền aw2 giống AuthWelcome */}
        <div className="aw2 authForm">
          <div className="aw2-bg" aria-hidden="true" />
          <div className="aw2-triangles" aria-hidden="true" />
          <div className="aw2-sparkle" aria-hidden="true" />

          <div className="authForm-content">
            <div className="authForm-topbar">
              <button className="authForm-back" onClick={() => navigate("/auth")} aria-label="Quay lại">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="authForm-topTitle">Đăng nhập</div>
            </div>

            {error && <div className="authForm-error">{error}</div>}

            <div className="authForm-card">
              <div className="authForm-cardBody">
                <div className="authForm-fields">
                  {/* Email */}
                  <div>
                    <div className="authForm-label">Email</div>
                    <input
                      className="authForm-input"
                      type="email"
                      placeholder="Nhập email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="authForm-label">Mật khẩu</div>
                    <input
                      className="authForm-input"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="authForm-cardFooter">
                <div className="authForm-actions">
                  <button className="authForm-btn authForm-btnPrimary" onClick={handleLogin} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </button>

                  <button className="authForm-btn authForm-btnGhost" onClick={() => navigate("/auth/register")} disabled={loading}>
                    Chưa có tài khoản? Đăng ký
                  </button>
                </div>
              </div>
            </div>


            {/* giữ khoảng thở dưới đáy */}
            <div style={{ flex: "1 1 auto" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

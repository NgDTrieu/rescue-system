import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // State quản lý dữ liệu nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State quản lý lỗi và loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Reset trạng thái cũ
    setError("");
    setLoading(true);

    try {
      // 2. Gọi API Login
      // Lưu ý: Thay URL bằng import.meta.env.VITE_API_URL nếu bạn muốn dùng biến môi trường
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // 3. Đăng nhập thành công -> Lưu token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. Kiểm tra trạng thái Công ty (Logic nghiệp vụ)
      if (data.user.role === "COMPANY" && data.user.companyStatus !== "ACTIVE") {
        alert(`Tài khoản công ty đang ở trạng thái: ${data.user.companyStatus}. Một số tính năng sẽ bị hạn chế cho đến khi Admin duyệt.`);
      }

      // 5. Chuyển hướng vào trang chính
      navigate("/");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell" style={{ padding: "30px 20px" }}>
        <h2 style={{ marginTop: 0, textAlign: "center", color: "#0b1b33" }}>Đăng nhập</h2>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div style={{ color: "red", background: "#fee", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: "15px" }}>
          
          {/* Input Email */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Email</label>
            <input 
              type="email"
              placeholder="Nhập email..." 
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} // Bấm Enter để login ngay
            />
          </div>

          {/* Input Password */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Mật khẩu</label>
            <input 
              type="password"
              placeholder="Nhập mật khẩu..." 
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Nút Đăng nhập */}
          <button 
            className="btn btn-primary" 
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {/* Đường kẻ phân cách */}
          <div style={{ height: "1px", background: "#eee", margin: "5px 0" }}></div>

          {/* Nút chuyển sang Đăng ký */}
          <button 
            className="btn btn-outline" 
            onClick={() => navigate("/auth/register")}
          >
            Tạo tài khoản mới
          </button>

        </div>
      </div>
    </div>
  );
}
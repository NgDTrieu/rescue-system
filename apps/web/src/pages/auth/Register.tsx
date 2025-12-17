import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Nếu bạn đã tạo service api thì import, nếu chưa thì dùng fetch/axios trực tiếp
// import api from "../../services/api"; 

export default function Register() {
  const navigate = useNavigate();

  // 1. Quản lý toàn bộ dữ liệu form trong 1 state object cho gọn
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CUSTOMER", // Mặc định là khách hàng
    companyName: ""   // Chỉ dùng khi role = COMPANY
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý chung cho mọi ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleRegister = async () => {
    setError(""); // Reset lỗi cũ
    setLoading(true);

    try {
      // 2. Gọi API đăng ký
      // Lưu ý: Thay URL này bằng import.meta.env.VITE_API_URL nếu bạn muốn chuẩn chỉnh
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // 3. Đăng ký thành công -> Chuyển sang trang Login
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell" style={{ padding: "30px 20px", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0, textAlign: "center", color: "#0b1b33" }}>Đăng ký tài khoản</h2>
        
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div style={{ color: "red", background: "#fee", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: "12px" }}>
          {/* Họ tên */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Họ tên</label>
            <input 
              name="name"
              placeholder="Nguyễn Văn A" 
              className="custom-input" // Bạn có thể thêm class CSS hoặc style trực tiếp
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Email</label>
            <input 
              name="email"
              type="email"
              placeholder="email@example.com" 
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Mật khẩu</label>
            <input 
              name="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự" 
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Số điện thoại</label>
            <input 
              name="phone"
              placeholder="0912..." 
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px" }}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Vai trò (Role) */}
          <div>
            <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Bạn là?</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px", backgroundColor: "#fff" }}
            >
              <option value="CUSTOMER">Người cần cứu hộ (Khách hàng)</option>
              <option value="COMPANY">Đơn vị cứu hộ (Công ty)</option>
            </select>
          </div>

          {/* Logic hiển thị Tên công ty: Chỉ hiện khi Role là COMPANY */}
          {formData.role === "COMPANY" && (
            <div style={{ animation: "fadeIn 0.3s ease-in" }}>
              <label style={{fontSize: "13px", fontWeight: 600, color: "#555"}}>Tên đơn vị cứu hộ</label>
              <input 
                name="companyName"
                placeholder="VD: Cứu hộ Ba Đình..." 
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "4px", borderColor: "#1f6fe5" }}
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Nút Đăng ký */}
          <button 
            className="btn btn-primary" 
            onClick={handleRegister} 
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>

          {/* Link quay lại Login */}
          <button 
            className="btn btn-outline" 
            onClick={() => navigate("/auth/login")}
          >
            Đã có tài khoản? Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
import { Navigate } from "react-router-dom";
import CustomerHome from "./CustomerHome";
import CompanyHome from "./CompanyHome";

export default function Home() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) return <div style={{ padding: 16 }}>Bạn chưa đăng nhập.</div>;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "COMPANY") return <CompanyHome />;
  return <CustomerHome />;
}

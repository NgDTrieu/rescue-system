import CustomerHome from "./CustomerHome";
import CompanyHome from "./CompanyHome";

export default function Home() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) return <div style={{ padding: 16 }}>Bạn chưa đăng nhập.</div>;

  if (user.role === "COMPANY") return <CompanyHome />;
  return <CustomerHome />;
}

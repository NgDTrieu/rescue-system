import { useState } from "react";
import AppShell from "./AppShell";
import BottomNav from "./BottomNav";
import "./home.css";
import logo from "../../assets/logochuan.png";
import { useNavigate } from "react-router-dom";


function QuickAction({
  icon,
  label,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
}) {
  return (
    <button className="qa">
      <div className="qa-ico" style={{ background: bg }}>
        {icon}
      </div>
      <div className="qa-txt">{label}</div>
    </button>
  );
}

export default function CustomerHome() {

  const navigate = useNavigate();

  const [tab, setTab] = useState("home");

  // mock providers
  const providers = [
    { name: "Cứu hộ Minh Tâm", rating: 4.8, distance: "2.5 km" },
    { name: "Cứu hộ Đông Đô", rating: 4.6, distance: "3.8 km" },
  ];

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const userName = user?.name || "bạn";

  const handleNav = (key: string) => {
    setTab(key);
    if (key === "requests") navigate("/customer/requests");
    if (key === "home") navigate("/home");
    if (key === "account") navigate ("/customer/account");
    if (key === "chat") navigate("/chat");

    // các key khác nếu company chưa dùng thì cứ để sau
  };


  return (
    <AppShell>
        <div className="page">
        {/* Header */}
        <div className="hero">
            <div className="hero-top">
                <img className="hero-logo" src={logo} alt="RoadHelp" />
                <div className="hero-badge">Customer</div>
            </div>

            <div className="hero-title">Xin chào, {userName}!</div>
            <div className="hero-sub">Bạn cần hỗ trợ gì hôm nay?</div>
        </div>


        {/* 4 actions */}
        <div className="actionGrid">
            <button 
                className="actionCard"
                onClick={() => navigate("/customer/rescue/new")}
            >
            <div className="actionIcon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                    d="M7 7h10M7 12h10M7 17h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                </svg>
            </div>
            <div className="actionTitle">Gửi yêu cầu cứu hộ</div>
            <div className="actionDesc">Tạo yêu cầu nhanh, gửi vị trí và mô tả sự cố.</div>
            </button>

            <button 
              className="actionCard"
              onClick={() => navigate("/customer/requests")}
            >
            <div className="actionIcon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 11.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
                    fill="currentColor"
                />
                </svg>
            </div>
            <div className="actionTitle">Danh sách yêu cầu</div>
            <div className="actionDesc">Theo dõi trạng thái: chờ nhận, đang xử lý, hoàn thành.</div>
            </button>

            <button 
              className="actionCard"
              onClick={() => navigate("/customer/community")}
            >
            <div className="actionIcon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                    d="M20 15a4 4 0 0 1-4 4H8l-4 3V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                </svg>
            </div>
            <div className="actionTitle">Tư vấn cộng đồng</div>
            <div className="actionDesc">Hỏi nhanh – đáp gọn, mẹo xử lý sự cố phổ biến.</div>
            </button>

            <button 
              className="actionCard"
              onClick = {() => navigate("/customer/requests/history")}  
            >
            <div className="actionIcon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 8v5l3 2"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <path
                    d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                </svg>
            </div>
            <div className="actionTitle">Lịch sử cứu hộ</div>
            <div className="actionDesc">Xem lại các lần cứu hộ đã hoàn thành, đánh giá dịch vụ.</div>
            </button>
        </div>
        </div>

        <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
    );

}

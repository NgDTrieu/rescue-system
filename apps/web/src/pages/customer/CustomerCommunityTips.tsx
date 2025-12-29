import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../home/BottomNav";
import "../home/home.css";
import "./community.css"; // File CSS chúng ta đã tạo ở bước trước

type TipItem = {
  id: string;
  title: string;
  solution: string;
  createdAt?: string;
  authorName?: string;
};

type TipsResponse = {
  count: number;
  items: TipItem[];
};

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("accessToken") || "";
}

// Component con xử lý hiển thị từng Tip
function TipCard({ tip }: { tip: TipItem }) {
  const [expanded, setExpanded] = useState(false);
  // Ngưỡng ký tự để hiển thị nút "Xem thêm"
  const isLong = tip.solution.length > 150;

  return (
    <div className="listCard">
      <div className="cardHeader">
        <div className="cardTitle">{tip.title}</div>
        <div className="statusPill">Tips</div>
      </div>

      <div className="solutionWrapper">
        <div className={`cardDesc ${!expanded && isLong ? "collapsed" : ""}`}>
          {tip.solution}
        </div>
        {isLong && (
          <button 
            className="readMoreBtn" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Thu gọn" : "Xem thêm..."}
          </button>
        )}
      </div>

      <div className="cardFooter">
        <span className="author">Bởi: {tip.authorName || "Ẩn danh"}</span>
        <span className="date">
          {tip.createdAt ? new Date(tip.createdAt).toLocaleDateString("vi-VN") : ""}
        </span>
      </div>
    </div>
  );
}

export default function CustomerCommunityTips() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<TipsResponse>({ count: 0, items: [] });

  const [tab, setTab] = useState("home");

  const totalPages = useMemo(() => {
    const n = Math.ceil((data.count || 0) / limit);
    return Math.max(1, n);
  }, [data.count]);

  async function fetchTips() {
    setLoading(true);
    setErr(null);
    try {
      const offset = (page - 1) * limit;
      let url = `${API_URL}/community/tips?limit=${limit}&offset=${offset}`;
      if (q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải dữ liệu");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTips();
  }, [page]);

    // BottomNav dùng chung => mapping riêng cho CUSTOMER ngay tại màn này
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/customer/requests");
    if (key === "account") navigate("/customer/account"); // bạn tạo sau
    if (key === "chat") navigate("/chat");

  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <div className="app-screen">
          {/* Header */}
          <div className="topBar">
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
            <div className="topBarTitle">
              <div className="title">Cộng đồng cứu hộ</div>
              <div className="subTitle">Kinh nghiệm xử lý sự cố</div>
            </div>
          </div>

          <div className="page">
            {/* Search & Create Button */}
            <div className="searchSection">
              <input
                className="input"
                placeholder="Tìm kiếm kinh nghiệm..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchTips()}
              />
              <button 
                className="btnPrimary" 
                style={{ marginTop: 12 }}
                onClick={() => navigate("/customer/community/new")}
              >
                + Chia sẻ kinh nghiệm
              </button>
            </div>

            {loading && <div className="hintBox">Đang tải dữ liệu...</div>}
            {err && <div className="hintBox errorBox">{err}</div>}

            <div className="tipsList">
              {data.items.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>

            {!loading && !err && data.items.length === 0 && (
              <div className="emptyBox">
                Chưa có tư vấn nào. Hãy là người đầu tiên chia sẻ!
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btnIconSmall"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ◄
                </button>
                <div className="pageIndicator">Trang {page}/{totalPages}</div>
                <button
                  className="btnIconSmall"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ►
                </button>
              </div>
            )}
          </div>

          <BottomNav activeKey={tab} onChange={handleNav} />
        </div>
      </div>
    </div>
  );
}
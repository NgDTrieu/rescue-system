import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type CompletedListItem = {
  id: string;
  status: "COMPLETED";
  createdAt: string;
};

type ListResp = {
  status: string;
  count: number;
  items: CompletedListItem[];
};

type RequestDetail = {
  id: string;
  status: "COMPLETED" | "CANCELLED" | "PENDING" | "ASSIGNED" | "IN_PROGRESS";
  customer?: { id?: string; name?: string; phone?: string; email?: string };
  customerRating?: number | null;
  customerReview?: string | null;
  customerConfirmedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string;
  createdAt: string;
};

type FeedbackItem = {
  id: string;
  customerName: string;
  rating: number;
  review?: string | null;
  dateISO: string;
};

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="ratingStars" aria-label={`${v}/5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < v ? "star on" : "star"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function CompanyFeedback() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("home");

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const token = useMemo(() => localStorage.getItem("accessToken") || "", []);

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [avg, setAvg] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calcAvg = (arr: FeedbackItem[]) => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((s, x) => s + x.rating, 0);
    return Math.round((sum / arr.length) * 10) / 10; // 1 chữ số thập phân
  };

  const fetchCompletedList = async () => {
    const res = await fetch(`${API}/company/requests?status=COMPLETED`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không tải được danh sách COMPLETED");
    return data as ListResp;
  };

  const fetchDetail = async (id: string) => {
    const res = await fetch(`${API}/company/requests/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không tải được chi tiết yêu cầu");
    return data as RequestDetail;
  };

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const list = await fetchCompletedList();
      const ids = (list.items || []).map((x) => x.id);

      if (ids.length === 0) {
        setItems([]);
        setCount(0);
        setAvg(0);
        setLoading(false);
        return;
      }

      // NOTE: để có customerName chắc chắn, ta lấy detail từng request COMPLETED.
      // Đồ án OK. Nếu sau này cần tối ưu, mình sẽ giúp cache / phân trang.
      const details = await Promise.all(ids.map((rid) => fetchDetail(rid)));

      const feedbacks: FeedbackItem[] = details
        .filter((d) => typeof d.customerRating === "number") // chỉ lấy những cái đã được đánh giá
        .map((d) => ({
          id: d.id,
          customerName: d.customer?.name || "Khách hàng",
          rating: d.customerRating as number,
          review: d.customerReview ?? null,
          // ngày đánh giá: ưu tiên customerConfirmedAt, fallback completedAt/updatedAt/createdAt
          dateISO: d.customerConfirmedAt ?? d.completedAt ?? d.updatedAt ?? d.createdAt,
        }))
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

      setItems(feedbacks);
      setCount(feedbacks.length);
      setAvg(calcAvg(feedbacks));
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
      setItems([]);
      setCount(0);
      setAvg(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // BottomNav dùng chung => điều hướng theo role tại màn
  const handleNav = (key: string) => {
    setTab(key);
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/company/requests");
    if (key === "account") navigate ("/company/account");
    if (key === "chat") navigate("/chat");

  };

  return (
    <AppShell>
      <div className="page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

          <div style={{ flex: 1 }}>
            <div className="h1" style={{ fontSize: 18 }}>
              Đọc phản hồi
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              Tổng hợp từ các yêu cầu <b>COMPLETED</b> đã được khách hàng đánh giá
            </div>
          </div>

          <button className="dash-bell" onClick={load} aria-label="Tải lại" title="Tải lại">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12a8 8 0 1 1-2.34-5.66"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 4v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div style={{ height: 12 }} />

        {error && <div className="authForm-error">{error}</div>}

        {/* Average */}
        <div className="card">
          <div className="sub" style={{ marginTop: 0 }}>
            {loading ? "Đang tải..." : `Có ${count} đánh giá`}
          </div>

          <div style={{ height: 8 }} />

          <div className="avgRow">
            <div>
              <div className="avgNum">{avg.toFixed(1)}</div>
              <div className="sub" style={{ marginTop: 6 }}>
                Điểm trung bình
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <Stars value={Math.round(avg)} />
              <div className="sub" style={{ marginTop: 6 }}>
                (tính từ {count} đánh giá)
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {/* List */}
        <div className="card">
          <div className="h1" style={{ fontSize: 16 }}>
            Danh sách phản hồi
          </div>
          <div className="sub">
            Chỉ hiển thị tên khách hàng, số sao, nhận xét và ngày đánh giá. Bấm vào để xem chi tiết yêu cầu.
          </div>

          <div style={{ height: 10 }} />

          {!loading && items.length === 0 && !error && (
            <div className="sub">Chưa có phản hồi nào.</div>
          )}

          <div className="feedbackList">
            {items.map((f) => (
              <button
                key={f.id}
                className="feedbackCard"
                onClick={() => navigate(`/company/requests/${f.id}`)}
              >
                <div className="feedbackTop">
                  <div>
                    <div className="feedbackName">{f.customerName}</div>
                    <Stars value={f.rating} />
                  </div>

                  <div className="feedbackDate">
                    {new Date(f.dateISO).toLocaleString("vi-VN")}
                  </div>
                </div>

                {f.review ? (
                  <div className="reviewBox">“{f.review}”</div>
                ) : (
                  <div className="sub" style={{ marginTop: 8 }}>
                    Không có nhận xét.
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

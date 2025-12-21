import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

import "./customerHistory.css";

type Detail = {
  id: string;
  status: string;
  issueType?: string;
  addressText?: string;
  quotedBasePrice?: number;
  createdAt?: string;
  completedAt?: string | null;
  customerConfirmedAt?: string | null;
  customerRating?: number | null;
  customerReview?: string | null;
};

export default function CustomerRescueHistory() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const [tab, setTab] = useState("home");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<Detail[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function apiGet<T>(url: string): Promise<T> {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data as T;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const list = await apiGet<{ items: any[] }>(`${API}/requests/my?status=COMPLETED`);
        const details = await Promise.allSettled(
          (list.items || []).map((it) => apiGet<Detail>(`${API}/requests/${it.id}`))
        );
        const okDetails = details
          .filter((r): r is PromiseFulfilledResult<Detail> => r.status === "fulfilled")
          .map((r) => r.value)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (!cancelled) setItems(okDetails);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [API, refreshKey]);

  const { rated, unrated } = useMemo(() => {
    const r: Detail[] = [];
    const u: Detail[] = [];
    items.forEach(it => {
      const hasRating = (it.customerRating && it.customerRating > 0) || !!it.customerConfirmedAt;
      (hasRating ? r : u).push(it);
    });
    return { rated: r, unrated: u };
  }, [items]);

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
          {/* Header */}
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
              <div className="pageTitle">Lịch sử cứu hộ</div>
              <div className="pageSubtitle">Các yêu cầu đã hoàn thành</div>
            </div>
            <button className="dash-bell" onClick={() => setRefreshKey(k => k + 1)} aria-label="Tải lại" title="Tải lại">
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

          {/* Content - Dùng class .page từ home.css */}
          <div className="page">
            {loading ? (
              <div className="hintBox">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="hintBox errorBox">{error}</div>
            ) : (
              <>
                <div className="historySummary">
                  <div className="sumPill"><span className="dot dotBlue" /> Tổng: {items.length}</div>
                  <div className="sumPill"><span className="dot dotOrange" /> Chưa đánh giá: {unrated.length}</div>
                  <div className="sumPill"><span className="dot dotGreen" /> Đã đánh giá: {rated.length}</div>
                </div>

                <Section title="Chưa đánh giá" badge={unrated.length}>
                  {unrated.map(it => (
                    <HistoryCard key={it.id} item={it} status="UNRATED" onClick={() => navigate(`/customer/requests/${it.id}`)} />
                  ))}
                </Section>

                <Section title="Đã đánh giá" badge={rated.length}>
                  {rated.map(it => (
                    <HistoryCard key={it.id} item={it} status="RATED" onClick={() => navigate(`/customer/requests/${it.id}`)} />
                  ))}
                </Section>
              </>
            )}
          </div>

          <BottomNav activeKey={tab} onChange={handleNav} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, badge, children }: any) {
  return (
    <div className="historySection">
      <div className="historySectionHeader">
        <div className="historySectionTitle">{title}</div>
        <div className="historySectionBadge">{badge}</div>
      </div>
      {children.length > 0 ? children : <div className="historyEmpty">Không có dữ liệu</div>}
    </div>
  );
}

function HistoryCard({ item, onClick, status }: any) {
  return (
    <button className="historyCard" onClick={onClick}>
      <div className="historyCardTop">
        <div className="historyTitle">{item.issueType || "Cứu hộ"}</div>
        <div className={`historyChip ${status === 'RATED' ? 'chipGreen' : 'chipOrange'}`}>
          {status === 'RATED' ? "Đã đánh giá" : "Chưa đánh giá"}
        </div>
      </div>
      <div className="historyMeta">
        <div className="metaRow"><span className="metaLabel">Địa chỉ</span><span className="metaVal">{item.addressText}</span></div>
        <div className="metaRow"><span className="metaLabel">Giá gốc</span><span className="metaVal">{(item.quotedBasePrice || 0).toLocaleString()} đ</span></div>
        <div className="metaRow"><span className="metaLabel">Tạo lúc</span><span className="metaVal">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
        {status === "RATED" && (
          <div className="metaRow"><span className="metaLabel">Số sao</span><span className="metaVal">{item.customerRating}/5</span></div>
        )}
      </div>
    </button>
  );
}
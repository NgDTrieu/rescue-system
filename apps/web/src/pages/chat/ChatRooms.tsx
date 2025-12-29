import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";
import "./chat.css";

type Room = {
  requestId: string;
  status: string;
  issueType: string;
  addressText: string;
  updatedAt: string;
  peer: null | { id: string; name: string; email: string; role: string };
  lastMessage: null | { text: string; senderRole: string; createdAt: string };
};

type RoomsResp = {
  count: number;
  items: Room[];
};

export default function ChatRooms() {
  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("vi-VN");
    } catch {
      return iso;
    }
  };

  const badgeKey = (s: string) => (s || "").toLowerCase();

  const getSortTime = (r: Room) => {
    // ✅ ưu tiên thời gian last message, fallback updatedAt
    const t = r.lastMessage?.createdAt || r.updatedAt;
    const ms = new Date(t).getTime();
    return isNaN(ms) ? 0 : ms;
  };

  const load = async () => {
    if (!token) {
      setErr("Thiếu accessToken. Hãy đăng nhập lại.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${API}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as RoomsResp & { message?: string };
      if (!res.ok) throw new Error((data as any)?.message || "Không tải được danh sách chat");

      const items = (data.items || []) as Room[];

      // ✅ sort desc theo tin nhắn mới nhất
      items.sort((a, b) => getSortTime(b) - getSortTime(a));

      setRooms(items);
    } catch (e: any) {
      setErr(e?.message || "Có lỗi xảy ra");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNav = (key: string) => {
    if (key === "home") navigate("/home");
    if (key === "requests") navigate("/home");
    if (key === "chat") navigate("/chat");
    if (key === "account") navigate("/home");
  };

  return (
    <AppShell>
      <div className="page">
        <div className="card chatTop">
          <div>
            <div className="h1">Tin nhắn</div>
            <div className="sub">Phòng chat chỉ xuất hiện khi công ty đã phản hồi (ASSIGNED).</div>
          </div>
          <button className="dash-bell" onClick={load} aria-label="Tải lại" title="Tải lại">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* <button className="chatTinyBtn" onClick={load} disabled={loading}>
            {loading ? "..." : "Tải lại"}
          </button> */}
        </div>

        {err && (
          <div className="card" style={{ marginTop: 10 }}>
            <div className="sub" style={{ color: "#ff4d4f", fontWeight: 900 }}>
              {err}
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {rooms.length === 0 ? (
            <div className="card">
              <div className="sub" style={{ textAlign: "center" }}>
                Chưa có phòng chat nào. (Chờ công ty nhận yêu cầu)
              </div>
            </div>
          ) : (
            rooms.map((r) => (
              <button
                key={r.requestId}
                className="chatRoomItem"
                onClick={() => navigate(`/chat/${r.requestId}`)}
              >
                <div className="chatRoomHeader">
                  <div className="chatPeerName">{r.peer?.name || "Đối tác"}</div>
                  <span className={`chatBadge chatBadge--${badgeKey(r.status)}`}>{r.status}</span>
                </div>

                <div className="chatMetaRow">
                  <span>{r.issueType || "Yêu cầu cứu hộ"}</span>
                  <span>{fmtDate(r.lastMessage?.createdAt || r.updatedAt)}</span>
                </div>

                {!!r.addressText && <div className="chatAddr">{r.addressText}</div>}

                <div className="chatLast">
                  {r.lastMessage ? r.lastMessage.text : "(Chưa có tin nhắn)"}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <BottomNav activeKey={"chat"} onChange={handleNav} />
    </AppShell>
  );
}

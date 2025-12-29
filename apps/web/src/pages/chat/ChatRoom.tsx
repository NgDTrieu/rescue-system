import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../home/AppShell";
import "../home/home.css";
import "./chat.css";

type Msg = {
  id: string;
  senderId: string;
  senderRole: "CUSTOMER" | "COMPANY";
  text: string;
  createdAt: string;
};

type RoomMeta = {
  requestId: string;
  status: string;
  issueType: string;
  addressText: string;
  peer: null | { id: string; name: string; email: string; role: string };
  title: string;
  subtitle: string;
};

type LoadResp = {
  room: RoomMeta;
  requestId: string;
  count: number;
  items: Msg[];
  requestStatus: string;
  message?: string;
};

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: string) {
  const k = (status || "").toLowerCase();
  if (k === "pending") return "chatBadge--pending";
  if (k === "assigned" || k === "in_progress") return "chatBadge--assigned";
  if (k === "completed") return "chatBadge--completed";
  if (k === "cancelled") return "chatBadge--cancelled";
  return "";
}

export default function ChatRoom() {
  const { requestId } = useParams();
  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const myRole = user?.role as "CUSTOMER" | "COMPANY";

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [room, setRoom] = useState<RoomMeta | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("");

  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ dùng ref để polling không bị phụ thuộc msgs
  const lastCreatedAtRef = useRef<string>("");

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const loadInitial = async () => {
    if (!requestId || !token) return;

    setErr("");
    try {
      const res = await fetch(`${API}/chat/rooms/${requestId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (await res.json()) as LoadResp;

      if (!res.ok) throw new Error(data?.message || "Không thể mở phòng chat");

      setRoom(data.room);
      const status = data.requestStatus || data.room?.status || "";
      setRoomStatus(status);

      const items = data.items || [];
      setMsgs(items);

      lastCreatedAtRef.current = items[items.length - 1]?.createdAt || "";
      setInitialLoaded(true);

      setTimeout(() => scrollToBottom(false), 60);
    } catch (e: any) {
      setRoom(null);
      setMsgs([]);
      setInitialLoaded(false);
      setErr(e?.message || "Có lỗi xảy ra");
    }
  };

  // load khi đổi phòng
  useEffect(() => {
    lastCreatedAtRef.current = "";
    setMsgs([]);
    setRoom(null);
    setRoomStatus("");
    setText("");
    setErr("");
    setInitialLoaded(false);

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const readOnly = roomStatus === "COMPLETED" || roomStatus === "CANCELLED";

  // ✅ Polling tin mới: cứ 2s gọi after=lastCreatedAt
  const pollNew = async () => {
    if (!requestId || !token) return;
    if (!initialLoaded) return; // chưa load room thì thôi
    if (!room) return; // pending bị chặn => room null

    const after = lastCreatedAtRef.current;
    const url = after
      ? `${API}/chat/rooms/${requestId}/messages?after=${encodeURIComponent(after)}&limit=100`
      : `${API}/chat/rooms/${requestId}/messages?limit=100`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = (await res.json()) as LoadResp;

      if (!res.ok) return;

      const status = data.requestStatus || data.room?.status || "";
      if (status && status !== roomStatus) setRoomStatus(status);

      const newItems = (data.items || []) as Msg[];
      if (newItems.length > 0) {
        setMsgs((prev) => [...prev, ...newItems]);
        lastCreatedAtRef.current = newItems[newItems.length - 1]?.createdAt || after;
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      // polling fail thì bỏ qua
    }
  };

  useEffect(() => {
    const t = setInterval(pollNew, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, initialLoaded, room]);

  const send = async () => {
    if (!requestId || !token || !room) return;
    const t = text.trim();
    if (!t) return;

    setErr("");
    try {
      const res = await fetch(`${API}/chat/rooms/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: t }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gửi thất bại");

      setText("");
      setMsgs((prev) => [...prev, data]);
      lastCreatedAtRef.current = data.createdAt || lastCreatedAtRef.current;
      setTimeout(() => scrollToBottom(true), 50);
    } catch (e: any) {
      setErr(e?.message || "Có lỗi xảy ra");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  const title = room?.title || "Tin nhắn";
  const subtitle = room?.subtitle || "";

  return (
    <AppShell>
      <div className="page">
        {/* Header */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div className="h1" style={{ fontSize: 16, lineHeight: 1.15 }}>
                {title}
              </div>

              <div className="sub" style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {subtitle ? <span style={{ fontWeight: 850 }}>{subtitle}</span> : null}
                {roomStatus ? (
                  <span className={`chatBadge ${statusBadgeClass(roomStatus)}`}>
                    {roomStatus}
                  </span>
                ) : null}
              </div>
            </div>

            <button className="chatTinyBtn" onClick={() => navigate("/chat")}>
              Danh sách
            </button>
          </div>

          {err && (
            <div className="sub" style={{ marginTop: 10, color: "#ff4d4f", fontWeight: 900 }}>
              {err}
            </div>
          )}
        </div>

        {/* Nếu backend chặn pending => room null */}
        {!room ? (
          <div className="card" style={{ marginTop: 12, padding: 16 }}>
            <div className="sub" style={{ fontWeight: 900 }}>
              ⏳ Phòng chat chưa sẵn sàng.
            </div>
            <div className="sub" style={{ marginTop: 8 }}>
              Chat chỉ mở khi công ty đã phản hồi yêu cầu (ASSIGNED).
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => navigate("/chat")}>Về danh sách</button>
              <button className="btn" onClick={loadInitial}>Thử lại</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
            {/* Thread */}
            <div
              style={{
                height: "58vh",
                overflow: "auto",
                padding: 14,
                background: "linear-gradient(180deg, rgba(11,23,54,0.02), rgba(11,23,54,0.00))",
              }}
            >
              {msgs.length === 0 ? (
                <div className="sub" style={{ textAlign: "center", padding: 20 }}>
                  Chưa có tin nhắn.
                </div>
              ) : (
                msgs.map((m) => {
                  const mine = m.senderRole === myRole;
                  return (
                    <div
                      key={m.id}
                      className={`chatMsgRow ${mine ? "is-me" : "is-other"}`}
                      style={{ marginBottom: 10 }}
                    >
                      <div className={`chatBubble ${mine ? "is-me" : ""}`}>
                        <div style={{ fontSize: 13, fontWeight: 850 }}>{m.text}</div>
                        <div className="chatTime">{fmtTime(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                borderTop: "1px solid rgba(11,23,54,0.08)",
                padding: 12,
                background: "#fff",
                opacity: readOnly ? 0.7 : 1,
              }}
            >
              {readOnly ? (
                <div className="sub" style={{ fontWeight: 900, marginBottom: 8 }}>
                  ✅ Yêu cầu đã kết thúc — chỉ xem lịch sử.
                </div>
              ) : (
                <div className="sub" style={{ fontWeight: 900, marginBottom: 8 }}>
                  Nhập tin nhắn:
                </div>
              )}

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="input"
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    border: "2px solid rgba(11,23,54,0.10)",
                    background: "rgba(11,23,54,0.03)",
                    padding: "0 12px",
                    fontWeight: 800,
                    outline: "none",
                  }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Gõ tin nhắn…"
                  disabled={readOnly}
                  onKeyDown={onKeyDown}
                />

                <button
                  className="btn"
                  style={{
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 14,
                    fontWeight: 950,
                    opacity: readOnly ? 0.5 : 1,
                  }}
                  onClick={send}
                  disabled={readOnly}
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

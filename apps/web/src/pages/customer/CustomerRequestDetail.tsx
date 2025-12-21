import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";
import "./customerRequests.css";


type ReqStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type Detail = {
  id: string;
  status: ReqStatus;
  category?: { id: string; key: string; name: string };
  company?: { id: string; companyName: string; phone: string; companyStatus: string };
  quotedBasePrice?: number;
  etaMinutes?: number | null;
  issueType?: string;
  note?: string;
  contactName?: string;
  contactPhone?: string;
  addressText?: string;
  location?: { lat: number; lng: number };
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  customerConfirmedAt?: string | null;
  customerRating?: number | null;
  customerReview?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

function formatMoney(v?: number) {
  if (v == null) return "—";
  return `${v.toLocaleString("vi-VN")} đ`;
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${d.toLocaleDateString("vi-VN")}`;
}

function statusLabel(s: ReqStatus) {
  return s;
}

export default function CustomerRequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // cancel
  const [cancelReason, setCancelReason] = useState("");

  // rating
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");

  const canCancel = useMemo(() => {
    if (!detail) return false;
    return detail.status !== "COMPLETED" && detail.status !== "CANCELLED";
  }, [detail]);

  const canRate = useMemo(() => {
    if (!detail) return false;
    // chỉ cho đánh giá khi COMPLETED và chưa confirmed
    return detail.status === "COMPLETED" && !detail.customerConfirmedAt;
  }, [detail]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setErr(null);
      const data = await apiJson<Detail>(`/requests/${id}`);
      setDetail(data);

      // preset rating/review nếu đã có
      if (data.customerRating) setRating(data.customerRating);
      if (data.customerReview) setReview(data.customerReview);
    } catch (e: any) {
      setErr(e?.message || "Không thể tải chi tiết yêu cầu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitCancel() {
    if (!id) return;
    const reason = cancelReason.trim();
    if (!reason) {
      setToast("Vui lòng nhập lý do hủy.");
      return;
    }
    try {
      setToast(null);
      await apiJson(`/requests/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      setToast("Đã hủy yêu cầu.");
      setCancelReason("");
      await load();
    } catch (e: any) {
      setToast(e?.message || "Hủy yêu cầu thất bại.");
    }
  }

  async function submitConfirm() {
    if (!id) return;
    const r = Math.max(1, Math.min(5, rating));
    try {
      setToast(null);
      await apiJson(`/requests/${id}/confirm`, {
        method: "PATCH",
        body: JSON.stringify({
          rating: r,
          review: review?.trim() || "",
        }),
      });
      setToast("Cảm ơn bạn đã đánh giá!");
      await load();
    } catch (e: any) {
      setToast(e?.message || "Gửi đánh giá thất bại.");
    }
  }

  return (
    <AppShell>
      <div className="screen">
        <div className="phone">
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
            <div className="topTitle">
              <div className="h1">Chi tiết yêu cầu</div>
              <div className="sub">ID: {id}</div>
            </div>
            <button className="iconBtn" onClick={load} aria-label="Refresh" title="Tải lại">
              ⟳
            </button>
          </div>

          <div className="sheet scrollArea">
            {loading && <div className="muted">Đang tải...</div>}
            {!loading && err && <div className="errorText">{err}</div>}

            {!loading && !err && detail && (
              <>
                {toast && <div className="sectionNote">{toast}</div>}

                <div className="sectionCard">
                  <div className="reqTop">
                    <div className="reqTitle">{detail.issueType || "Yêu cầu cứu hộ"}</div>
                    <div className="statusChip">{statusLabel(detail.status)}</div>
                  </div>

                  <div className="keyValue">
                    <div className="kvRow">
                      <div className="kvKey">Dịch vụ</div>
                      <div className="kvVal">{detail.category?.name || "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Công ty</div>
                      <div className="kvVal">{detail.company?.companyName || "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">SĐT công ty</div>
                      <div className="kvVal">{detail.company?.phone || "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Giá gốc</div>
                      <div className="kvVal">{formatMoney(detail.quotedBasePrice)}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">ETA</div>
                      <div className="kvVal">{detail.etaMinutes != null ? `${detail.etaMinutes} phút` : "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Địa chỉ</div>
                      <div className="kvVal">{detail.addressText || "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Liên hệ</div>
                      <div className="kvVal">
                        {(detail.contactName || "—") + " • " + (detail.contactPhone || "—")}
                      </div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Ghi chú</div>
                      <div className="kvVal">{detail.note || "—"}</div>
                    </div>
                    <div className="kvRow">
                      <div className="kvKey">Tạo lúc</div>
                      <div className="kvVal">{formatTime(detail.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* CANCEL INFO */}
                {detail.status === "CANCELLED" && (
                  <div className="sectionCard">
                    <div className="sectionTitle">Đã hủy</div>
                    <div className="keyValue">
                      <div className="kvRow">
                        <div className="kvKey">Lý do</div>
                        <div className="kvVal">{detail.cancelReason || "—"}</div>
                      </div>
                      <div className="kvRow">
                        <div className="kvKey">Hủy lúc</div>
                        <div className="kvVal">{formatTime(detail.cancelledAt)}</div>
                      </div>
                      <div className="kvRow">
                        <div className="kvKey">Hủy bởi</div>
                        <div className="kvVal">{detail.cancelledBy || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPLETE INFO */}
                {(detail.completedAt || detail.customerConfirmedAt) && (
                  <div className="sectionCard">
                    <div className="sectionTitle">Hoàn thành</div>
                    <div className="keyValue">
                      <div className="kvRow">
                        <div className="kvKey">Complete lúc</div>
                        <div className="kvVal">{formatTime(detail.completedAt || null)}</div>
                      </div>
                      <div className="kvRow">
                        <div className="kvKey">Bạn xác nhận lúc</div>
                        <div className="kvVal">{formatTime(detail.customerConfirmedAt || null)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RATING DISPLAY (nếu đã có) */}
                {detail.customerConfirmedAt && (
                  <div className="sectionCard">
                    <div className="sectionTitle">Đánh giá của bạn</div>
                    <div className="ratingRow">
                      <div className="ratingStars">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const idx = i + 1;
                          const active = (detail.customerRating || 0) >= idx;
                          return (
                            <span key={idx} className={`star ${active ? "active" : ""}`} aria-hidden="true">
                              ★
                            </span>
                          );
                        })}
                      </div>
                      <div className="muted">{detail.customerRating ? `${detail.customerRating}/5` : ""}</div>
                    </div>
                    {detail.customerReview ? <div className="reviewBox">{detail.customerReview}</div> : <div className="muted">Không có nội dung review.</div>}
                  </div>
                )}

                {/* RATE + CONFIRM */}
                {canRate && (
                  <div className="sectionCard">
                    <div className="sectionTitle">Đánh giá dịch vụ</div>
                    <div className="sectionSub">Chọn số sao và ghi nhận xét (tuỳ chọn), sau đó xác nhận hoàn thành.</div>

                    <div className="ratingRow" style={{ marginTop: 10 }}>
                      <div className="ratingStars">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const v = i + 1;
                          const active = rating >= v;
                          return (
                            <button
                              key={v}
                              type="button"
                              className={`starBtn ${active ? "active" : ""}`}
                              onClick={() => setRating(v)}
                              aria-label={`Chọn ${v} sao`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                      <div className="muted">{rating}/5</div>
                    </div>

                    <textarea
                      className="textarea"
                      placeholder="Nhận xét của bạn (tuỳ chọn)"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={3}
                      style={{ marginTop: 10 }}
                    />

                    <button className="btnPrimary" onClick={submitConfirm} style={{ marginTop: 12 }}>
                      Xác nhận & gửi đánh giá
                    </button>
                  </div>
                )}

                {/* CANCEL */}
                {canCancel && (
                  <div className="sectionCard">
                    <div className="sectionTitle">Hủy yêu cầu</div>
                    <div className="sectionSub">Bạn có thể hủy khi yêu cầu chưa hoàn thành. Vui lòng nhập lý do.</div>

                    <input
                      className="input"
                      placeholder='VD: "Tôi đã tự xử lý được"'
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      style={{ marginTop: 10 }}
                    />

                    <button className="btnDanger" onClick={submitCancel} style={{ marginTop: 12 }}>
                      Hủy yêu cầu
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <BottomNav
            activeKey="requests"
            onChange={(key) => {
              if (key === "home") navigate("/home");
              if (key === "requests") navigate("/customer/requests");
              if (key === "chat") navigate("/customer/chat");
              if (key === "account") navigate("/customer/account");
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}

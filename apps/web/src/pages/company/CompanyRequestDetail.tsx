import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "../home/AppShell";
import BottomNav from "../home/BottomNav";
import "../home/home.css";

type RequestDetail = {
  id: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  category: { id: string; key: string; name: string };
  customer: { id: string; name: string; phone: string; email: string };
  quotedBasePrice: number;
  etaMinutes: number | null;
  issueType: string;
  note?: string | null;
  contactName: string;
  contactPhone: string;
  addressText?: string | null;
  location: { lat: number; lng: number };
  cancelReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customerConfirmedAt?: string | null;
  customerRating?: number | null;
  customerReview?: string | null;

};

export default function CompanyRequestDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const id = params.id!;

  // Nếu điều hướng từ list sang, có thể nhận state (không bắt buộc)
  const stateReq: RequestDetail | undefined = (loc.state as any)?.req;

  const [req, setReq] = useState<RequestDetail | null>(stateReq || null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [etaMinutes, setEtaMinutes] = useState<number>(15);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const fetchDetail = async () => {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/company/requests/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tải được chi tiết yêu cầu");

      const detail = data as RequestDetail;
      setReq(detail);

      // Nếu backend đã có etaMinutes (không null), set vào input
      if (typeof detail.etaMinutes === "number") {
        setEtaMinutes(detail.etaMinutes);
      }
    } catch (e: any) {
      setErr(e.message || "Lỗi tải chi tiết");
      setReq(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Luôn fetch để đảm bảo dữ liệu mới nhất (tránh stale state)
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const acceptWithEta = async () => {
    if (!req) return;

    setSubmitErr("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập (thiếu accessToken).");

      if (!Number.isFinite(etaMinutes) || etaMinutes < 1) {
        throw new Error("ETA phải là số phút >= 1.");
      }

      const res = await fetch(`${API}/company/requests/${req.id}/eta`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ etaMinutes: Number(etaMinutes) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Nhận yêu cầu thất bại");

      // Patch OK: { id, status: "ASSIGNED", etaMinutes, updatedAt }
      // Cập nhật lại detail để đồng bộ UI (và tránh sai khác)
      await fetchDetail();

      // Quay về list yêu cầu mới (PENDING)
      navigate("/company/requests/pending", { replace: true });
    } catch (e: any) {
      setSubmitErr(e.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (nextStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (!req) return;

    setSubmitErr("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Bạn chưa đăng nhập (thiếu accessToken).");

      const res = await fetch(`${API}/company/requests/${req.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái thất bại");

      // data: { id, status, completedAt, updatedAt }
      await fetchDetail(); // sync UI

      // Nếu completed thì quay về list đang xử lý (nó sẽ biến mất)
      if (nextStatus === "COMPLETED") {
        navigate("/company/requests/in-progress", { replace: true });
      }
    } catch (e: any) {
      setSubmitErr(e.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

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
              Chi tiết yêu cầu
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              ID: <b>{id}</b>
            </div>
          </div>

          <button className="dash-bell" onClick={fetchDetail} aria-label="Tải lại" title="Tải lại">
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

        {err && <div className="authForm-error">{err}</div>}
        {submitErr && <div className="authForm-error">{submitErr}</div>}

        <div className="card">
          {loading && <div className="sub">Đang tải...</div>}

          {!loading && req && (
            <>
              {/* Top line */}
              <div className="companyTop">
                <div className="companyName">{req.issueType}</div>
                <div className="companyDist">{req.status}</div>
              </div>

              <div style={{ height: 10 }} />

              {/* Info */}
              <div className="detailGrid">
                <div className="detailRow">
                  <div className="detailKey">Dịch vụ</div>
                  <div className="detailVal">{req.category?.name}</div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">Khách hàng</div>
                  <div className="detailVal">{req.customer?.name}</div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">SĐT khách</div>
                  <div className="detailVal">{req.customer?.phone}</div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">Email</div>
                  <div className="detailVal">{req.customer?.email}</div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">Địa chỉ</div>
                  <div className="detailVal">
                    {req.addressText || `${req.location.lat}, ${req.location.lng}`}
                  </div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">Giá gốc</div>
                  <div className="detailVal">{formatMoney(req.quotedBasePrice)}</div>
                </div>

                <div className="detailRow">
                  <div className="detailKey">Tạo lúc</div>
                  <div className="detailVal">{new Date(req.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>

              {req.note ? (
                <>
                  <div style={{ height: 10 }} />
                  <div className="sub" style={{ marginTop: 0 }}>
                    <b>Ghi chú:</b> {req.note}
                  </div>
                </>
              ) : null}

              <div style={{ height: 14 }} />

              {/* ACTION: nhận yêu cầu chỉ khi PENDING */}
              {req.status === "PENDING" ? (
                <div className="card" style={{ background: "rgba(255,255,255,0.65)" }}>
                  <div className="h1" style={{ fontSize: 16 }}>
                    Nhận yêu cầu
                  </div>
                  <div className="sub">Nhập ETA (phút) trước khi nhận.</div>

                  <div style={{ height: 10 }} />

                  <div className="etaRow">
                    <input
                      className="authForm-input"
                      type="number"
                      min={1}
                      max={240}
                      value={etaMinutes}
                      onChange={(e) => setEtaMinutes(Number(e.target.value || 0))}
                      placeholder="VD: 15"
                    />
                  </div>

                  <div style={{ height: 12 }} />

                  <button
                    className="provider-btn"
                    style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
                    onClick={acceptWithEta}
                    disabled={submitting}
                  >
                    {submitting ? "Đang nhận..." : "Nhận yêu cầu (ASSIGNED)"}
                  </button>
                </div>
              ) : null}

              {req.status === "ASSIGNED" && (
                <div className="card" style={{ background: "rgba(255,255,255,0.65)", marginTop: 12 }}>
                  <div className="h1" style={{ fontSize: 16 }}>Cập nhật trạng thái</div>
                  <div className="sub">Bạn đã nhận yêu cầu. Bấm để bắt đầu xử lý.</div>

                  <div style={{ height: 12 }} />

                  <button
                    className="provider-btn"
                    style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
                    disabled={submitting}
                    onClick={() => updateStatus("IN_PROGRESS")}
                  >
                    {submitting ? "Đang cập nhật..." : "Bắt đầu xử lý (IN_PROGRESS)"}
                  </button>
                </div>
              )}

              {req.status === "IN_PROGRESS" && (
                <div className="card" style={{ background: "rgba(255,255,255,0.65)", marginTop: 12 }}>
                  <div className="h1" style={{ fontSize: 16 }}>Cập nhật trạng thái</div>
                  <div className="sub">Khi đã xử lý xong, bấm để hoàn thành.</div>

                  <div style={{ height: 12 }} />

                  <button
                    className="provider-btn"
                    style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
                    disabled={submitting}
                    onClick={() => updateStatus("COMPLETED")}
                  >
                    {submitting ? "Đang cập nhật..." : "Hoàn thành (COMPLETED)"}
                  </button>
                </div>
              )}

              {req.status === "COMPLETED" && (
                <>
                  <div style={{ height: 12 }} />

                  <div className="card" style={{ background: "rgba(255,255,255,0.65)" }}>
                    <div className="h1" style={{ fontSize: 16 }}>Đánh giá từ khách hàng</div>

                    {typeof req.customerRating === "number" ? (
                      <>
                        <div style={{ height: 8 }} />

                        <div className="ratingRow">
                          <div className="ratingStars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (req.customerRating || 0) ? "star on" : "star"}>
                                ★
                              </span>
                            ))}
                          </div>
                          <div className="ratingNum">{req.customerRating}/5</div>
                        </div>

                        {req.customerReview ? (
                          <div className="reviewBox">“{req.customerReview}”</div>
                        ) : (
                          <div className="sub" style={{ marginTop: 8 }}>Khách hàng không để lại nhận xét.</div>
                        )}

                        {req.customerConfirmedAt ? (
                          <div className="sub" style={{ marginTop: 10 }}>
                            Xác nhận lúc: {new Date(req.customerConfirmedAt).toLocaleString("vi-VN")}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="sub" style={{ marginTop: 8 }}>
                        Chưa có đánh giá từ khách hàng.
                      </div>
                    )}
                  </div>
                </>
              )}


            </>
          )}
        </div>
      </div>

      <BottomNav activeKey={tab} onChange={handleNav} />
    </AppShell>
  );
}

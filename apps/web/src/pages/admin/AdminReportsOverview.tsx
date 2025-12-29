import { useEffect, useMemo, useState } from "react";

type OverviewResp = {
  range: {
    from: string;
    to: string;
    toExclusive: string;
  };
  users: {
    total: number;
    customers: number;
    admins: number;
    companies: {
      total: number;
      byStatus: Record<string, number>;
    };
  };
  requests: {
    totalInRange: number;
    byStatus: Record<string, number>;
    respondedCount: number;
    responseRate: number; // 0..1
    completionRate: number; // 0..1
    cancelRate: number; // 0..1
    eta: { avgEtaMinutes: number | null; count: number };
    satisfaction: {
      ratedCount: number;
      avgRating: number | null;
      ratingDistribution: Record<string, number>;
    };
    topCategories: Array<{ categoryId: string; categoryName?: string; count: number }>;
    topCompanies: Array<{
      companyId: string;
      companyName?: string;
      email?: string;
      totalAssigned: number;
      responded: number;
      completed: number;
      cancelled: number;
      avgRating: number | null;
    }>;
    requestsPerDay: Array<{ date: string; count: number }>;
  };
};

function toDateInputValue(d: Date) {
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminReportsOverview() {
  const API = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:4000",
    []
  );
  const token = localStorage.getItem("accessToken");

  // default 30 ngày gần nhất
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const [from, setFrom] = useState(toDateInputValue(defaultFrom));
  const [to, setTo] = useState(toDateInputValue(today));

  const [data, setData] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nf = new Intl.NumberFormat("vi-VN");

  const pct = (x: number) => `${Math.round(x * 1000) / 10}%`; // 1 decimal
  const fmtRating = (x: number | null) => (x == null ? "-" : (Math.round(x * 10) / 10).toString());
  const fmtEta = (x: number | null) => (x == null ? "-" : `${Math.round(x)} phút`);

  const fetchOverview = async () => {
    if (!token) {
      setError("Thiếu accessToken. Hãy đăng nhập ADMIN lại.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = new URL(`${API}/admin/reports/overview`);
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Không tải được báo cáo");

      setData(json as OverviewResp);
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byStatus = (key: string) => data?.requests.byStatus?.[key] || 0;

  // chart data
  const perDay = data?.requests.requestsPerDay || [];
  const maxDay = perDay.reduce((m, x) => Math.max(m, x.count), 0);

  return (
    <div className="ad-card">
      <div className="ad-row" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="ad-title">Báo cáo thống kê</div>
          <div className="ad-muted">
            Tổng hợp người dùng, yêu cầu cứu hộ, tỷ lệ phản hồi, ETA, mức độ hài lòng…
          </div>
        </div>

        <div className="ad-row" style={{ gap: 10 }}>
          <div>
            <label className="ad-label">Từ ngày</label>
            <input className="ad-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="ad-label">Đến ngày</label>
            <input className="ad-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <button className="ad-btn primary" onClick={fetchOverview} disabled={loading}>
            {loading ? "Đang tải..." : "Xem báo cáo"}
          </button>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {error && <div className="ad-alert error">{error}</div>}

      {!data ? null : (
        <>
          {/* KPI cards */}
          <div className="ad-kpiGrid">
            <div className="ad-kpi">
              <div className="ad-kpiLabel">Tổng người dùng</div>
              <div className="ad-kpiValue">{nf.format(data.users.total)}</div>
              <div className="ad-muted">
                Customer: <b>{nf.format(data.users.customers)}</b> — Company:{" "}
                <b>{nf.format(data.users.companies.total)}</b>
              </div>
            </div>

            <div className="ad-kpi">
              <div className="ad-kpiLabel">Yêu cầu cứu hộ</div>
              <div className="ad-kpiValue">{nf.format(data.requests.totalInRange)}</div>
              <div className="ad-muted">
                Completed: <b>{nf.format(byStatus("COMPLETED"))}</b> — Cancelled:{" "}
                <b>{nf.format(byStatus("CANCELLED"))}</b>
              </div>
            </div>

            <div className="ad-kpi">
              <div className="ad-kpiLabel">Tỷ lệ phản hồi</div>
              <div className="ad-kpiValue">{pct(data.requests.responseRate)}</div>
              <div className="ad-muted">
                Đã phản hồi: <b>{nf.format(data.requests.respondedCount)}</b> /{" "}
                {nf.format(data.requests.totalInRange)}
              </div>
            </div>

            <div className="ad-kpi">
              <div className="ad-kpiLabel">Mức độ hài lòng</div>
              <div className="ad-kpiValue">{fmtRating(data.requests.satisfaction.avgRating)} / 5</div>
              <div className="ad-muted">
                Có đánh giá: <b>{nf.format(data.requests.satisfaction.ratedCount)}</b>
              </div>
            </div>

            <div className="ad-kpi">
              <div className="ad-kpiLabel">ETA trung bình</div>
              <div className="ad-kpiValue">{fmtEta(data.requests.eta.avgEtaMinutes)}</div>
              <div className="ad-muted">
                <b>{nf.format(data.requests.eta.count)}</b> request có ETA
              </div>
            </div>

            <div className="ad-kpi">
              <div className="ad-kpiLabel">Tỷ lệ hoàn thành</div>
              <div className="ad-kpiValue">{pct(data.requests.completionRate)}</div>
              <div className="ad-muted">Tỷ lệ huỷ: <b>{pct(data.requests.cancelRate)}</b></div>
            </div>
          </div>

          <div style={{ height: 14 }} />

          {/* Requests breakdown + trend */}
          <div className="ad-twoCol">
            <div className="ad-card">
              <div className="ad-title">Trạng thái yêu cầu</div>
              <div className="ad-muted" style={{ marginBottom: 10 }}>
                PENDING/ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED
              </div>

              <div className="ad-statList">
                <div className="ad-statRow">
                  <span>PENDING</span>
                  <b>{nf.format(byStatus("PENDING"))}</b>
                </div>
                <div className="ad-statRow">
                  <span>ASSIGNED</span>
                  <b>{nf.format(byStatus("ASSIGNED"))}</b>
                </div>
                <div className="ad-statRow">
                  <span>IN_PROGRESS</span>
                  <b>{nf.format(byStatus("IN_PROGRESS"))}</b>
                </div>
                <div className="ad-statRow">
                  <span>COMPLETED</span>
                  <b>{nf.format(byStatus("COMPLETED"))}</b>
                </div>
                <div className="ad-statRow">
                  <span>CANCELLED</span>
                  <b>{nf.format(byStatus("CANCELLED"))}</b>
                </div>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-title">Xu hướng yêu cầu theo ngày</div>
              <div className="ad-muted" style={{ marginBottom: 10 }}>
                (Dùng để vẽ biểu đồ đơn giản)
              </div>

              {perDay.length === 0 ? (
                <div className="ad-empty">Không có dữ liệu.</div>
              ) : (
                <div className="ad-barChart">
                  {perDay.map((x) => {
                    const h = maxDay > 0 ? Math.round((x.count / maxDay) * 100) : 0;
                    return (
                      <div key={x.date} className="ad-barCol" title={`${x.date}: ${x.count}`}>
                        <div className="ad-bar" style={{ height: `${h}%` }} />
                        <div className="ad-barLabel">{x.date.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 14 }} />

          {/* Top categories + top companies */}
          <div className="ad-twoCol">
            <div className="ad-card">
              <div className="ad-title">Top dịch vụ (Category)</div>
              <div className="ad-muted" style={{ marginBottom: 10 }}>
                Top 5 theo số lượng yêu cầu
              </div>

              <div className="ad-tableWrap">
                <table className="ad-table" style={{ minWidth: 0 }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th style={{ width: 120 }}>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.requests.topCategories || []).map((c) => (
                      <tr key={c.categoryId}>
                        <td style={{ fontWeight: 700 }}>
                          {c.categoryName || "(Không tìm thấy tên category)"}
                          <div className="ad-muted" style={{ fontSize: 12 }}>
                            {c.categoryId}
                          </div>
                        </td>
                        <td><b>{nf.format(c.count)}</b></td>
                      </tr>
                    ))}
                    {data.requests.topCategories?.length === 0 ? (
                      <tr><td colSpan={2} className="ad-empty">Không có dữ liệu.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-title">Top công ty</div>
              <div className="ad-muted" style={{ marginBottom: 10 }}>
                Top 5 theo tổng số request được gán
              </div>

              <div className="ad-tableWrap">
                <table className="ad-table" style={{ minWidth: 0 }}>
                  <thead>
                    <tr>
                      <th>Công ty</th>
                      <th style={{ width: 110 }}>Assigned</th>
                      <th style={{ width: 110 }}>Completed</th>
                      <th style={{ width: 90 }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.requests.topCompanies || []).map((c) => (
                      <tr key={c.companyId}>
                        <td>
                          <div style={{ fontWeight: 800 }}>
                            {c.companyName || "(Chưa đặt tên)"}
                          </div>
                          <div className="ad-muted" style={{ fontSize: 12 }}>
                            {c.email || ""} {c.companyId ? `— ${c.companyId}` : ""}
                          </div>
                        </td>
                        <td><b>{nf.format(c.totalAssigned)}</b></td>
                        <td><b>{nf.format(c.completed)}</b></td>
                        <td><b>{fmtRating(c.avgRating)}</b></td>
                      </tr>
                    ))}
                    {data.requests.topCompanies?.length === 0 ? (
                      <tr><td colSpan={4} className="ad-empty">Không có dữ liệu.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ height: 14 }} />

          {/* Rating distribution */}
          <div className="ad-card">
            <div className="ad-title">Phân bố đánh giá (1..5 sao)</div>
            <div className="ad-muted" style={{ marginBottom: 10 }}>
              Tổng lượt đánh giá: <b>{nf.format(data.requests.satisfaction.ratedCount)}</b>
            </div>

            <div className="ad-ratingRow">
              {["1", "2", "3", "4", "5"].map((k) => {
                const v = data.requests.satisfaction.ratingDistribution?.[k] || 0;
                const pctVal =
                  data.requests.satisfaction.ratedCount > 0
                    ? v / data.requests.satisfaction.ratedCount
                    : 0;
                return (
                  <div key={k} className="ad-ratingCard">
                    <div className="ad-kpiLabel">{k} sao</div>
                    <div className="ad-kpiValue" style={{ fontSize: 18 }}>
                      {nf.format(v)}
                    </div>
                    <div className="ad-muted">{pct(pctVal)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

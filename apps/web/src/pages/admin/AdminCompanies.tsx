import { useEffect, useMemo, useState } from "react";

type CompanyStatus = "PENDING" | "ACTIVE" | "REJECTED";

type CompanyItem = {
  id: string;
  email: string;
  role: "COMPANY" | "CUSTOMER" | "ADMIN";
  name?: string;
  phone?: string;
  companyName?: string;
  companyStatus: CompanyStatus;
  createdAt: string;
};

type ListResp = {
  status: CompanyStatus;
  count: number;
  items: CompanyItem[];
};

export default function AdminCompanies() {
  const API = useMemo(() => import.meta.env.VITE_API_URL || "http://localhost:4000", []);
  const [status, setStatus] = useState<CompanyStatus>("PENDING");

  const [items, setItems] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string>("");

  const token = localStorage.getItem("accessToken");

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return iso;
    }
  };

  const load = async (s: CompanyStatus) => {
    setLoading(true);
    setError("");
    setActionMsg("");

    try {
      const res = await fetch(`${API}/admin/companies?status=${s}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Không tải được danh sách company");

      const payload = data as ListResp;
      setItems(payload.items || []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateCompanyStatus = async (id: string, nextStatus: Exclude<CompanyStatus, "PENDING">) => {
    if (!token) {
      setError("Thiếu accessToken. Hãy đăng nhập lại.");
      return;
    }

    const ok = window.confirm(
      nextStatus === "ACTIVE"
        ? "Duyệt công ty này (ACTIVE)?"
        : "Từ chối công ty này (REJECTED)?"
    );
    if (!ok) return;

    setActionLoadingId(id);
    setError("");
    setActionMsg("");

    try {
      const res = await fetch(`${API}/admin/companies/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyStatus: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Cập nhật trạng thái thất bại");

      // Update UI ngay (không cần reload)
      setItems((prev) => {
        const updated = prev.map((x) => (x.id === id ? { ...x, companyStatus: nextStatus } : x));
        // nếu tab hiện tại khác nextStatus, loại khỏi list
        return updated.filter((x) => x.companyStatus === status);
      });

      setActionMsg(
        nextStatus === "ACTIVE" ? "✅ Đã duyệt công ty." : "✅ Đã từ chối công ty."
      );
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="ad-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div className="ad-title">Danh sách công ty</div>
          <div className="ad-muted">
            Chọn trạng thái để lọc. Tab <b>PENDING</b> sẽ có nút Duyệt/Từ chối.
          </div>
        </div>

        <button className="ad-btn" onClick={() => load(status)} disabled={loading}>
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      <div style={{ height: 12 }} />

      {/* Tabs */}
      <div className="ad-tabs">
        {(["PENDING", "ACTIVE", "REJECTED"] as CompanyStatus[]).map((s) => (
          <button
            key={s}
            className={`ad-tab ${status === s ? "active" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ height: 12 }} />

      {actionMsg && <div className="ad-alert success">{actionMsg}</div>}
      {error && <div className="ad-alert error">{error}</div>}

      <div style={{ height: 10 }} />

      {/* Table */}
      <div className="ad-tableWrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Công ty</th>
              <th>Người đại diện</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th style={{ width: 220 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className="ad-empty">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : null}

            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{c.companyName || "(Chưa đặt tên công ty)"}</div>
                  <div className="ad-muted" style={{ fontSize: 12 }}>ID: {c.id}</div>
                </td>
                <td>{c.name || "-"}</td>
                <td>{c.email}</td>
                <td>{c.phone || "-"}</td>
                <td>{fmtDate(c.createdAt)}</td>
                <td>
                  <span className={`ad-badge ${c.companyStatus.toLowerCase()}`}>
                    {c.companyStatus}
                  </span>
                </td>
                <td>
                  {status === "PENDING" ? (
                    <div className="ad-actions">
                      <button
                        className="ad-btn small primary"
                        disabled={actionLoadingId === c.id}
                        onClick={() => updateCompanyStatus(c.id, "ACTIVE")}
                      >
                        {actionLoadingId === c.id ? "..." : "Duyệt"}
                      </button>
                      <button
                        className="ad-btn small danger"
                        disabled={actionLoadingId === c.id}
                        onClick={() => updateCompanyStatus(c.id, "REJECTED")}
                      >
                        {actionLoadingId === c.id ? "..." : "Từ chối"}
                      </button>
                    </div>
                  ) : (
                    <div className="ad-actions">
                      {status === "ACTIVE" ? (
                        <button
                          className="ad-btn small danger"
                          disabled={actionLoadingId === c.id}
                          onClick={() => updateCompanyStatus(c.id, "REJECTED")}
                          title="Chuyển sang REJECTED"
                        >
                          {actionLoadingId === c.id ? "..." : "Từ chối"}
                        </button>
                      ) : (
                        <button
                          className="ad-btn small primary"
                          disabled={actionLoadingId === c.id}
                          onClick={() => updateCompanyStatus(c.id, "ACTIVE")}
                          title="Chuyển sang ACTIVE"
                        >
                          {actionLoadingId === c.id ? "..." : "Kích hoạt"}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

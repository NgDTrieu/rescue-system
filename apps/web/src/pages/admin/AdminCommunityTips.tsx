import { useEffect, useMemo, useState } from "react";

type TipItem = {
  id: string;
  title: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null | {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
};

type ListResp = {
  page: number;
  limit: number;
  total: number;
  count: number;
  items: TipItem[];
};

export default function AdminCommunityTips() {
  const API = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:4000",
    []
  );

  const token = localStorage.getItem("accessToken");

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState(""); // query đã apply

  const [page, setPage] = useState(1);
  const limit = 10;

  const [items, setItems] = useState<TipItem[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // modal edit
  const [editing, setEditing] = useState<TipItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [saving, setSaving] = useState(false);

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return iso;
    }
  };

  const fetchList = async () => {
    if (!token) {
      setError("Thiếu accessToken. Hãy đăng nhập ADMIN lại.");
      return;
    }

    setLoading(true);
    setError("");
    setMsg("");

    try {
      const url = new URL(`${API}/admin/community-tips`);
      if (q.trim()) url.searchParams.set("q", q.trim());
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Không tải được danh sách tips");

      const payload = data as ListResp;
      setItems(payload.items || []);
      setTotal(payload.total || 0);
    } catch (e: any) {
      setItems([]);
      setTotal(0);
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  const openEdit = (t: TipItem) => {
    setEditing(t);
    setEditTitle(t.title);
    setEditSolution(t.solution);
    setMsg("");
    setError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle("");
    setEditSolution("");
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!token) {
      setError("Thiếu accessToken. Hãy đăng nhập ADMIN lại.");
      return;
    }

    const title = editTitle.trim();
    const solution = editSolution.trim();

    if (!title || !solution) {
      setError("Title và Solution không được để trống.");
      return;
    }

    setSaving(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch(`${API}/admin/community-tips/${editing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, solution }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Cập nhật thất bại");

      // update UI ngay
      setItems((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? {
                ...x,
                title,
                solution,
                updatedAt: new Date().toISOString(),
              }
            : x
        )
      );

      setMsg("✅ Đã cập nhật tip.");
      closeEdit();
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const deleteTip = async (t: TipItem) => {
    if (!token) {
      setError("Thiếu accessToken. Hãy đăng nhập ADMIN lại.");
      return;
    }

    const ok = window.confirm(
      `Bạn chắc chắn muốn xoá tip?\n\n"${t.title}"`
    );
    if (!ok) return;

    setError("");
    setMsg("");

    try {
      const res = await fetch(`${API}/admin/community-tips/${t.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Xoá thất bại");

      // remove khỏi list
      setItems((prev) => prev.filter((x) => x.id !== t.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      setMsg("✅ Đã xoá tip.");
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    }
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="ad-card">
      <div className="ad-row">
        <div>
          <div className="ad-title">Community Tips</div>
          <div className="ad-muted">
            Admin có thể tìm kiếm, sửa hoặc xoá các tip không phù hợp.
          </div>
        </div>

        <button className="ad-btn" onClick={fetchList} disabled={loading}>
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      <div style={{ height: 12 }} />

      {/* Search */}
      <div className="ad-row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label className="ad-label">Tìm kiếm (title/solution)</label>
          <input
            className="ad-input"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Nhập từ khoá..."
          />
        </div>

        <button
          className="ad-btn primary"
          onClick={() => {
            setPage(1);
            setQ(qInput);
          }}
        >
          Tìm
        </button>

        <button
          className="ad-btn"
          onClick={() => {
            setQInput("");
            setPage(1);
            setQ("");
          }}
        >
          Xoá lọc
        </button>
      </div>

      <div style={{ height: 12 }} />

      {msg && <div className="ad-alert success">{msg}</div>}
      {error && <div className="ad-alert error">{error}</div>}

      <div style={{ height: 10 }} />

      {/* Table */}
      <div className="ad-tableWrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Người đăng</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
              <th style={{ width: 170 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="ad-empty">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : null}

            {items.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 800 }}>{t.title}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>
                  {t.solution.length > 200 ? t.solution.slice(0, 200) + "…" : t.solution}
                </td>
                <td>
                  {t.createdBy ? (
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {t.createdBy.name || "(Không tên)"}
                      </div>
                      <div className="ad-muted" style={{ fontSize: 12 }}>
                        {t.createdBy.email}
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{fmtDate(t.createdAt)}</td>
                <td>{fmtDate(t.updatedAt)}</td>
                <td>
                  <div className="ad-actions">
                    <button className="ad-btn small" onClick={() => openEdit(t)}>
                      Sửa
                    </button>
                    <button className="ad-btn small danger" onClick={() => deleteTip(t)}>
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="ad-paging">
        <div className="ad-muted">
          Tổng: <b>{total}</b> tips — Trang <b>{page}</b>/<b>{totalPages}</b>
        </div>

        <div className="ad-actions">
          <button
            className="ad-btn small"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Trang trước
          </button>
          <button
            className="ad-btn small"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Modal Edit */}
      {editing && (
        <div className="ad-modalOverlay" onClick={closeEdit}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modalHeader">
              <div>
                <div className="ad-title">Sửa Community Tip</div>
                <div className="ad-muted">ID: {editing.id}</div>
              </div>
              <button className="ad-btn small" onClick={closeEdit}>
                Đóng
              </button>
            </div>

            <div style={{ height: 10 }} />

            <label className="ad-label">Tiêu đề</label>
            <input
              className="ad-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <div style={{ height: 10 }} />

            <label className="ad-label">Nội dung</label>
            <textarea
              className="ad-textarea"
              value={editSolution}
              onChange={(e) => setEditSolution(e.target.value)}
              rows={8}
            />

            <div style={{ height: 12 }} />

            <div className="ad-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ad-btn" onClick={closeEdit} disabled={saving}>
                Huỷ
              </button>
              <button className="ad-btn primary" onClick={saveEdit} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

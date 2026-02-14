import React from "react";
import Fuse from "fuse.js";
import "./index.css";

function normalizeVN(s = "") {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const vnd = new Intl.NumberFormat("vi-VN");

export default function App() {
  const [rows, setRows] = React.useState([]);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const fuse = React.useMemo(() => {
    return new Fuse(rows, {
      includeScore: true,
      threshold: 0.35,
      keys: [{ name: "name", getFn: (item) => normalizeVN(item.name) }],
    });
  }, [rows]);

  const results = React.useMemo(() => {
    const query = normalizeVN(q);
    if (!query) return rows; // ✅ trả về hết
    return fuse.search(query).map((x) => x.item); // ✅ trả về hết
  }, [q, fuse, rows]);

  return (
    <div className="container">
      <div className="header">
        <h1>Tra cứu bì thư</h1>
      </div>

      <div className="controls">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nhập tên cần tìm…"
        />
      </div>

      <div className="table">
        <div className="row header">
          <div>Tên</div>
          <div className="money">Số tiền</div>
        </div>

        {results.map((r, idx) => (
          <div className="row" key={`${r.name}-${idx}`}>
            <div>{r.name}</div>
            <div className="money">{r.amount == null ? "-" : `${vnd.format(r.amount)} đ`}</div>
          </div>
        ))}

        {!results.length && <div className="empty">Không có kết quả.</div>}
      </div>

      <div className="meta">Tổng dữ liệu: {rows.length} dòng • Kết quả: {results.length} dòng</div>
    </div>
  );
}

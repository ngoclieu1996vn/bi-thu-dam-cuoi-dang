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
  const [amountSelected, setAmountSelected] = React.useState(""); // "" = tất cả

  // ✅ load data (đúng khi deploy GitHub Pages)
  React.useEffect(() => {
    fetch(`data.json`)
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  // ✅ danh sách số tiền đang có trong data
  const amountOptions = React.useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      if (typeof r.amount === "number" && Number.isFinite(r.amount)) {
        set.add(r.amount);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  // ✅ lọc theo số tiền trước
  const rowsFilteredByAmount = React.useMemo(() => {
    if (!amountSelected) return rows;
    const selected = Number(amountSelected);
    return rows.filter((r) => r.amount === selected);
  }, [rows, amountSelected]);

  // ✅ Fuse search trên tập đã lọc
  const fuse = React.useMemo(() => {
    return new Fuse(rowsFilteredByAmount, {
      includeScore: true,
      threshold: 0.35,
      keys: [{ name: "name", getFn: (item) => normalizeVN(item.name) }],
    });
  }, [rowsFilteredByAmount]);

  const results = React.useMemo(() => {
    const query = normalizeVN(q);
    if (!query) return rowsFilteredByAmount;
    return fuse.search(query).map((x) => x.item);
  }, [q, fuse, rowsFilteredByAmount]);

  return (
    <div className="container">
      <div className="header">
        <h1>Tra cứu bì thư</h1>
        <p className="sub">
          Search gần đúng theo tên + lọc theo số tiền (lấy từ dữ liệu).
        </p>
      </div>

      <div className="controls">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nhập tên cần tìm…"
        />

        <select
          className="select"
          value={amountSelected}
          onChange={(e) => setAmountSelected(e.target.value)}
          title="Lọc theo số tiền"
        >
          <option value="">Tất cả số tiền</option>
          {amountOptions.map((amt) => (
            <option key={amt} value={amt}>
              {vnd.format(amt)} đ
            </option>
          ))}
        </select>
      </div>

      <div className="table">
        <div className="row header">
          <div>Tên (cột A)</div>
          <div className="money">Số tiền (cột B)</div>
        </div>

        {results.map((r, idx) => (
          <div className="row" key={`${r.name}-${idx}`}>
            <div>{r.name}</div>
            <div className="money">{r.amount == null ? "-" : `${vnd.format(r.amount)} đ`}</div>
          </div>
        ))}

        {!results.length && <div className="empty">Không có kết quả.</div>}
      </div>

      <div className="meta">
        Tổng dữ liệu: {rows.length} dòng • Sau lọc: {rowsFilteredByAmount.length} • Kết quả:{" "}
        {results.length}
      </div>
    </div>
  );
}

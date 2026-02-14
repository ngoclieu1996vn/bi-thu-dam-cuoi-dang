import fs from "fs";
import path from "path";
import xlsx from "xlsx";

const excelPath = path.resolve("data/bì thư.xlsx");
if (!fs.existsSync(excelPath)) {
  console.error("❌ Không tìm thấy file:", excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];

// header:1 => trả về dạng mảng theo từng dòng: [A, B, C...]
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: true });

const data = rows
  .map((r) => {
    const name = (r?.[0] ?? "").toString().trim();   // cột A
    const amountRaw = r?.[1];                        // cột B
    if (!name) return null;

    // amount có thể là number hoặc string
    const amount =
      typeof amountRaw === "number"
        ? amountRaw
        : Number(String(amountRaw ?? "").replace(/[^\d.-]/g, ""));

    return {
      name,
      amount: Number.isFinite(amount) ? amount : null,
    };
  })
  .filter(Boolean);

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/data.json", JSON.stringify(data, null, 2), "utf-8");

console.log(`✅ Đã xuất ${data.length} dòng -> public/data.json`);

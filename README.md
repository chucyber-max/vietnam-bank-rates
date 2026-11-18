# 🇻🇳 Vietnam Bank Savings & Interest Rate Comparator (Lãi Suất Tiết Kiệm VN)

Ứng dụng web tài chính (FinTech) hiện đại, đáp ứng cao (responsive), cho phép người dùng tính toán chính xác tiền lãi tiết kiệm và đối soát, so sánh lợi suất thực nhận giữa **14 ngân hàng hàng đầu Việt Nam** theo thời gian thực.

![Banner](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Tính Năng Nổi Bật

1. **Hai Phương Thức Tiết Kiệm Chuyên Sâu:**
   - **Mode A: Gửi tích lũy hàng tháng (Installment Savings):** Gửi đều đặn số tiền $M$ vào đầu mỗi tháng trong $n$ tháng. Tính theo công thức trọng số tháng tích lũy chuẩn:
     $$\text{weightedMonths} = \frac{n \times (n + 1)}{2}$$
     $$\text{totalInterest} = \text{Math.round}\left(M \times \frac{\text{ratePercent}}{100 \times 12} \times \text{weightedMonths}\right)$$
   - **Mode B: Gửi có kỳ hạn một lần (Lump-sum Term Deposit):** Gửi số tiền lớn một lần kèm tùy chọn **Tự động tái tục gốc & lãi (Lãi kép)** qua $k$ chu kỳ:
     $$\text{totalReceived} = \text{Math.round}\left(P \times \left(1 + \frac{\text{ratePercent}}{100} \times \frac{n}{12}\right)^k\right)$$
   - **Mode C: Dự toán thiệt hại khi rút trước hạn (Early Withdrawal Warning Estimator):** Mô phỏng tính phạt rút vốn sớm theo Thông tư 04/2022/TT-NHNN với lãi suất không kỳ hạn (0,1% - 0,5%/năm), chỉ rõ số tiền lãi bị mất trắng so với giữ đến ngày đáo hạn.

2. **Dữ liệu 14 Ngân Hàng Toàn Diện:**
   - **Big4 Nhà nước:** Vietcombank (`VCB`), BIDV (`BIDV`), Agribank (`AGR`), VietinBank (`CTG`).
   - **Ngân hàng TMCP:** Techcombank (`TCB`), MB Bank (`MBB`), VPBank (`VPB`), ACB (`ACB`), TPBank (`TPB`), MSB (`MSB`), OCB (`OCB`), LPBank (`LPB`), PGBank (`PGB`).
   - **Ngân hàng số:** Cake by VPBank (`CAKE`).
   - Đầy đủ kỳ hạn `1, 3, 6, 9, 12, 18, 24` tháng cho cả 2 kênh **Gửi Online** và **Gửi tại quầy**.

3. **Giao Diện FinTech Chuẩn Mực:**
   - **Bảng xếp hạng trực quan:** Huy hiệu Vàng/Bạc/Đồng, badge màu sắc thương hiệu chính thức từng ngân hàng, số tiền định dạng chuẩn `vi-VN` (`3.000.000 ₫`) và chữ số dạng `tabular-nums`.
   - **Chuyển đổi số thành chữ:** Tự động đọc số tiền tiếng Việt thời gian thực (ví dụ: *Ba triệu đồng*, *Một trăm triệu đồng*).
   - **Biểu đồ tăng trưởng dòng tiền (Recharts):** Trực quan hóa tiến độ tích lũy vốn gốc so với lãi lũy kế qua từng tháng.
   - **Đối chiếu song song (Side-by-Side Modal):** Chọn tối đa 3 ngân hàng để so sánh từng tháng và tải tệp CSV xuất sắc.
   - **Xuất CSV với UTF-8 BOM:** Không bao giờ bị lỗi font tiếng Việt khi mở bằng Microsoft Excel.

4. **Trang Quản Trị Ma Trận Lãi Suất (`/admin/rates`):**
   - Khóa mật khẩu bảo mật `ADMIN_SECRET` trước khi truy cập.
   - Giao diện Spreadsheet trực quan cho 14 ngân hàng × 7 kỳ hạn.
   - Chuyển đổi linh hoạt giữa tab **Gửi Online** và **Gửi tại quầy**.
   - Đánh dấu ô đã chỉnh sửa màu vàng cam nổi bật (`bg-amber-50 border-amber-400`).
   - Nút **"Lưu thay đổi"** chỉ gửi các ô có biến động vào Supabase & tự động lưu vết lịch sử `rate_history`.
   - Nút **"Chạy đồng bộ tự động ngay"** kích hoạt cào dữ liệu WebGia tức thì.

5. **Tự Động Đồng Bộ Định Kỳ (Daily Cron & GitHub Actions):**
   - Route `GET /api/cron/update-rates` cào tự động từ WebGia và giải mã chuỗi hex `nb` thông minh.
   - Workflow `.github/workflows/sync-rates.yml` tự động chạy mỗi ngày lúc **08:30 sáng giờ Việt Nam** (01:30 UTC).

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Language:** TypeScript 5+ (Strict Mode)
- **Styling:** Tailwind CSS, Lucide React icons
- **Web Scraping:** Cheerio 1.2+
- **Charts:** Recharts
- **Effects:** Canvas Confetti
- **Database:** Supabase (`@supabase/supabase-js`) + PostgreSQL DDL & RLS Policies

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt phụ thuộc
```bash
pnpm install
```

### 2. Khởi chạy môi trường phát triển (Development)
```bash
pnpm dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)
Trang quản trị ma trận: [http://localhost:3000/admin/rates](http://localhost:3000/admin/rates)

### 3. Build sản phẩm (Production)
```bash
pnpm build
pnpm start
```

---

## 🗄️ Cấu Hình Supabase & Biến Môi Trường

1. **Khởi tạo Database trên Supabase:**
   - Vào Supabase Dashboard -> **SQL Editor**.
   - Copy toàn bộ nội dung file [`supabase/schema.sql`](supabase/schema.sql) và chạy (**Run**). File này chứa cấu trúc bảng `banks`, `deposit_rates`, `rate_history`, RLS policies và dữ liệu ban đầu của 14 ngân hàng.

2. **Cấu hình biến môi trường (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   CRON_SECRET=laisuatvn_cron_9f8a7b6c5d4e3f2a
   ADMIN_SECRET=KhanhAdmin@2026_SecretKey
   ```

---

## 🔄 API Tự Động Cập Nhật Lãi Suất (`/api/cron/update-rates`)

### 1. Tự động cào và cập nhật từ WebGia (GET)
Bảo vệ bằng header `Authorization: Bearer <CRON_SECRET>`:
```bash
curl -X GET "http://localhost:3000/api/cron/update-rates" \
  -H "Authorization: Bearer laisuatvn_cron_9f8a7b6c5d4e3f2a"
```
**Phản hồi:**
```json
{
  "success": true,
  "updatedCount": 92,
  "timestamp": "2026-11-18T03:52:00.000Z"
}
```

### 2. Cập nhật thủ công hàng loạt từ Admin (POST)
Bảo vệ bằng header `x-admin-password: <ADMIN_SECRET>`:
```bash
curl -X POST "http://localhost:3000/api/cron/update-rates" \
  -H "x-admin-password: KhanhAdmin@2026_SecretKey" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "bank_id": "b0000001-0000-0000-0000-000000000001",
        "deposit_type": "ONLINE",
        "term_months": 12,
        "rate_percent": 4.85
      }
    ]
  }'
```
**Phản hồi:**
```json
{
  "success": true,
  "count": 1,
  "timestamp": "2026-11-18T03:55:00.000Z"
}
```

---

## ⏱️ GitHub Actions Cron Workflow (`.github/workflows/sync-rates.yml`)

Để kích hoạt cron tự động trên GitHub:
1. Thêm 2 Secrets vào GitHub Repository (**Settings > Secrets and variables > Actions**):
   - `APP_URL`: Domain website đã deploy (ví dụ: `https://your-domain.vercel.app`)
   - `CRON_SECRET`: Trùng với `CRON_SECRET` trong `.env.local`
2. Workflow sẽ tự động chạy vào lúc **08:30 AM mỗi ngày (giờ Việt Nam)** hoặc chạy thủ công qua nút **Run workflow**.

---

## 📁 Cấu Trúc Dự Án

```
QLTD/
├── .github/
│   └── workflows/
│       └── sync-rates.yml         # GitHub Actions Daily Cron (08:30 AM VN)
├── supabase/
│   └── schema.sql                 # SQL DDL, RLS & Seed Data cho 14 ngân hàng
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── rates/
│   │   │       └── page.tsx       # Trang quản trị ma trận lãi suất (Khóa mật mã)
│   │   ├── api/
│   │   │   └── cron/
│   │   │       └── update-rates/  # API cào WebGia (GET) & Lưu ma trận (POST)
│   │   │           └── route.ts
│   │   ├── globals.css            # Tailwind & Custom fintech styles
│   │   ├── layout.tsx             # Root layout & Metadata SEO
│   │   └── page.tsx               # Dashboard chính tổng hợp
│   ├── components/
│   │   ├── Header.tsx             # Header, Quick stats, real-time status
│   │   ├── CalculatorControl.tsx  # Bộ điều khiển: Tabs, Slider, Chips, Pills
│   │   ├── BestBankHighlight.tsx  # Hero card vinh danh Top 1 ngân hàng
│   │   ├── GrowthChart.tsx        # Biểu đồ Recharts tăng trưởng vốn & lãi
│   │   ├── BankComparisonTable.tsx# Bảng xếp hạng chi tiết 14 ngân hàng
│   │   ├── SideBySideModal.tsx    # Modal đối chiếu song song tối đa 3 NH
│   │   ├── EarlyWithdrawalModal.tsx # Panel cảnh báo rút trước hạn (TT 04)
│   │   └── EducationalGuide.tsx   # Cẩm nang tài chính & FAQ
│   ├── data/
│   │   └── mockRates.ts           # Dữ liệu fallback 14 ngân hàng
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── admin.ts           # Supabase Server Admin Client (Bypass RLS)
│   │   ├── formatters.ts          # Định dạng tiền tệ VND & số liệu
│   │   ├── interestCalculator.ts  # Công thức toán tài chính chuẩn xác
│   │   ├── numberToVietnameseWords.ts # Đọc số tiền thành chữ tiếng Việt
│   │   ├── exportUtils.ts         # Xuất tệp CSV UTF-8 BOM
│   │   ├── rateService.ts         # Service fetch dữ liệu linh hoạt
│   │   └── supabaseClient.ts      # Khởi tạo Supabase client
│   └── types/
│       └── index.ts               # Định nghĩa TypeScript toàn bộ hệ thống
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
"# vietnam-bank-rates" 

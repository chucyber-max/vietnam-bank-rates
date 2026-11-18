import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Tính Lãi & So Sánh Tiết Kiệm Ngân Hàng | Lãi Suất Tiết Kiệm VN',
  description:
    'Công cụ so sánh lãi suất tiền gửi và tính toán dòng tiền tiết kiệm thực nhận tại 14 ngân hàng Việt Nam (Vietcombank, BIDV, Techcombank, MB, VPBank...). Hỗ trợ gửi tích lũy hàng tháng và gửi có kỳ hạn tái tục.',
  keywords: [
    'lãi suất tiết kiệm',
    'so sánh lãi suất ngân hàng',
    'tính lãi tiết kiệm',
    'gửi tích lũy hàng tháng',
    'lãi suất big4',
    'lãi suất techcombank',
    'lãi suất vietcombank',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

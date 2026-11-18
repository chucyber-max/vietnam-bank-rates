'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lightbulb,
  Scale,
  Sparkles,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  tag: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Công thức tính lãi suất tiền gửi của các ngân hàng Việt Nam hoạt động ra sao?',
    answer:
      'Theo Thông tư số 14/2017/TT-NHNN của Ngân hàng Nhà nước, tiền lãi được tính trên cơ sở 365 ngày theo công thức: Tiền lãi = (Số dư thực tế × Số ngày duy trì thực tế × Lãi suất tính lãi) / 365. Với kỳ hạn chẵn tháng, các ngân hàng thường quy đổi tương đương theo số tháng / 12 tháng.',
    tag: 'Pháp lý NHNN',
  },
  {
    question: 'Nên chọn "Gửi tích lũy hàng tháng" hay "Gửi một lần (Có kỳ hạn)"?',
    answer:
      'Gửi tích lũy hàng tháng (Installment Savings) phù hợp cho người có thu nhập định kỳ hàng tháng muốn rèn luyện thói quen tiết kiệm kỷ luật từ khoản tiền nhỏ. Trong khi đó, Gửi một lần (Lump-sum Deposit) dành cho người đã có sẵn một khoản tiền nhàn rỗi lớn và muốn hưởng mức lãi suất cao nhất ngay từ đầu.',
    tag: 'Chiến lược tài chính',
  },
  {
    question: 'Tại sao lãi suất gửi Online thường cao hơn gửi tại quầy từ 0,1% - 0,3%/năm?',
    answer:
      'Khi bạn gửi trực tuyến qua ứng dụng ngân hàng số, ngân hàng tiết kiệm được chi phí vận hành chi nhánh, nhân sự quầy giao dịch và in ấn sổ giấy. Do đó, các ngân hàng tái đầu tư chi phí tiết kiệm được này vào mức lãi suất cộng thêm để khuyến khích khách hàng giao dịch số.',
    tag: 'Tiết kiệm Online',
  },
  {
    question: 'Bí quyết chia nhỏ sổ tiết kiệm để không bị mất lãi khi cần tiền gấp?',
    answer:
      'Thay vì gửi toàn bộ 100 triệu vào 1 sổ duy nhất, bạn nên chia thành 3 sổ: 1 sổ 20 triệu (kỳ hạn 1-3 tháng để xoay sở việc bất ngờ), 1 sổ 30 triệu (kỳ hạn 6 tháng) và 1 sổ 50 triệu (kỳ hạn 12 tháng lãi cao). Nếu cần tiền gấp, bạn chỉ tất toán sớm sổ 20 triệu, 80 triệu còn lại vẫn được hưởng nguyên lãi suất cao.',
    tag: 'Mẹo tối ưu',
  },
  {
    question: 'Tiền gửi tại các ngân hàng TMCP và Ngân hàng số có an toàn như Big4 không?',
    answer:
      'Tất cả các tổ chức tín dụng được cấp phép tại Việt Nam đều chịu sự thanh tra, giám sát nghiêm ngặt của Ngân hàng Nhà nước và bắt buộc phải tham gia Bảo hiểm tiền gửi Việt Nam (DIV). Ngân hàng số như Cake by VPBank thực chất là nền tảng số do Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank) phát hành và bảo đảm an toàn thanh khoản.',
    tag: 'An toàn bảo mật',
  },
];

export const EducationalGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-fintech border border-slate-200/80 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Cẩm nang kiến thức & Chiến lược gửi tiết kiệm thông minh
          </h3>
          <p className="text-xs text-slate-500">
            Giải đáp quy định pháp lý, cách tính lãi suất và mẹo tối đa hóa lợi tức tiền gửi
          </p>
        </div>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>Khai thác sức mạnh lãi kép</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kích hoạt tính năng &quot;Tự động tái tục gốc & lãi&quot; để số tiền lãi tự động trở thành vốn mới, tạo đà tăng trưởng lũy tiến tài sản vượt bậc theo thời gian.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Kỳ hạn vàng 6 - 12 tháng</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khoảng thời gian 6 đến 12 tháng thường có mức lãi suất hấp dẫn nhất và không bị trượt giá quá nhiều so với các kỳ hạn siêu dài 18-24 tháng.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Bảo vệ quyền lợi gửi tiền</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Người gửi được bảo vệ bởi Bảo hiểm tiền gửi Việt Nam (DIV) và mạng lưới quản lý dự trữ bắt buộc khắt khe của Ngân hàng Nhà nước.
          </p>
        </div>
      </div>

      {/* Accordion FAQs */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-slate-800">
          Câu hỏi thường gặp của người gửi tiền (FAQ)
        </h4>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 shrink-0">
                      {faq.tag}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 py-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

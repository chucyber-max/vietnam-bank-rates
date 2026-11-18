'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Lightbulb,
  Scale,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  tag: string;
}

const LOAN_FAQS: FAQItem[] = [
  {
    question: 'Nên chọn cách trả theo "Dư nợ giảm dần" hay "Trả góp đều (Annuity)"?',
    answer:
      'Với "Dư nợ giảm dần", tiền gốc được chia đều hàng tháng và lãi tính trên số nợ thực tế còn lại. Cách này giúp tổng tiền lãi phải trả toàn kỳ thấp nhất, nhưng áp lực trả nợ trong những tháng đầu sẽ nặng nhất. Ngược lại, "Trả góp đều (Annuity)" giữ số tiền trả cố định mỗi tháng, giúp bạn dễ dàng lập ngân sách chi tiêu ổn định, phù hợp với người có thu nhập cố định hàng tháng.',
    tag: 'Phương thức trả',
  },
  {
    question: 'Lãi suất thả nổi sau thời gian ưu đãi được tính như thế nào?',
    answer:
      'Hầu hết các ngân hàng áp dụng công thức: Lãi suất thả nổi = Lãi suất cơ sở (hoặc Lãi suất huy động 12-24 tháng) + Biên độ thả nổi (thường từ 3,0% đến 4,5%/năm). Khi ký hợp đồng, bạn phải xem kỹ điều khoản biên độ này vì sau 1-2 năm ưu đãi, mức lãi suất thực tế bạn phải trả có thể tăng vọt lên 10% - 12%/năm.',
    tag: 'Lãi thả nổi',
  },
  {
    question: 'Phí phạt trả nợ trước hạn là bao nhiêu và cách tối ưu?',
    answer:
      'Thông thường, phí phạt trả trước hạn dao động từ 1% - 2% số tiền trả trước trong 1-3 năm đầu; giảm xuống 0,5% - 1% ở năm thứ 4-5 và hoàn toàn miễn phí từ năm thứ 5 trở đi. Mẹo tối ưu: Hãy hỏi rõ ngân hàng về chính sách cho phép trả trước hạn 1 khoản tiền nhỏ mỗi năm mà không bị tính phí.',
    tag: 'Phí phạt trả sớm',
  },
  {
    question: 'Có nên vay kỳ hạn tối đa (15 - 20 năm) dù có khả năng trả trong 5 năm?',
    answer:
      'NÊN! Khi chọn thời hạn vay 15-20 năm, số tiền gốc phải trả bắt buộc mỗi tháng sẽ rất nhỏ, giúp giảm tối đa áp lực tài chính và bảo đảm an toàn dòng tiền nếu gặp rủi ro công việc. Khi bạn tích lũy đủ khoản tiền lớn sau 3-5 năm, bạn có thể tất toán trước hạn; lúc này phí phạt trả trước hạn chỉ còn từ 0% - 0,5%.',
    tag: 'Chiến lược vay',
  },
  {
    question: 'Các khoản phí phát sinh bắt buộc khi làm hồ sơ vay thế chấp?',
    answer:
      'Ngoài lãi suất, người vay cần dự trù các chi phí: 1) Phí thẩm định định giá tài sản (1 - 3 triệu đồng); 2) Lệ phí công chứng hợp đồng thế chấp và phí đăng ký giao dịch bảo đảm tại Văn phòng đăng ký đất đai (1 - 2 triệu); 3) Bảo hiểm cháy nổ nhà/căn hộ bắt buộc (khoảng 0,05% - 0,1% giá trị tài sản/năm).',
    tag: 'Chi phí đi kèm',
  },
];

export const LoanEducationalGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-fintech border border-slate-200/80 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Cẩm nang & Kinh nghiệm vay vốn ngân hàng an toàn
          </h3>
          <p className="text-xs text-slate-500">
            Hiểu rõ biên độ thả nổi, phí phạt trả trước hạn và chiến lược cân đối dòng tiền trả nợ
          </p>
        </div>
      </div>

      {/* 3 Core Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>Kéo dài kỳ hạn để an toàn</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chọn kỳ hạn vay dài (15-20 năm) giúp số tiền trả tháng đầu ở mức thấp nhất, không làm nghẽn dòng tiền sinh hoạt gia đình, sau đó trả nợ trước hạn linh hoạt.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Cảnh giác biên độ thả nổi</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Đừng chỉ nhìn vào lãi suất ưu đãi 5-6% của năm đầu. Hãy hỏi kỹ biên độ cộng thêm sau ưu đãi (thường +3.5% đến +4.5%) để tính trước tiền lãi những năm sau.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Tỷ lệ DTI an toàn dưới 40%</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tổng số tiền trả nợ ngân hàng hàng tháng không nên vượt quá 40% thu nhập thực nhận của gia đình để đảm bảo an toàn tài chính dài hạn.
          </p>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-slate-800">
          Câu hỏi người đi vay thường gặp (FAQ)
        </h4>

        <div className="space-y-2">
          {LOAN_FAQS.map((faq, idx) => {
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

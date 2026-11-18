/**
 * PublishBottomSheet.tsx
 * بطاقة النشر الموحدة + موافقة بشرية إلزامية
 * منصات: حراج · مستعمل · 𝕏 · واتساب (wa.me فقط)
 */
import { Check, MessageCircle } from 'lucide-react';

type Props = {
  open: boolean;
  carTitle?: string;
  whatsappNumber?: string;
  publicUrl?: string;
  onApprove: () => void;
  onClose: () => void;
};

export default function PublishBottomSheet({
  open,
  carTitle = 'السيارة',
  whatsappNumber,
  publicUrl,
  onApprove,
  onClose,
}: Props) {
  if (!open) return null;

  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `مرحباً، أستفسر عن ${carTitle}${publicUrl ? '\n' + publicUrl : ''}`
      )}`
    : null;

  return (
    <div className="publish-sheet-overlay" onClick={onClose}>
      <div className="publish-sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="publish-sheet-handle" />
        <h3>تم تجهيز السيارة</h3>
        <p>راجع المحتوى ثم وافق قبل أي نشر</p>

        <div className="publish-platforms">
          <button type="button" className="publish-platform">
            <span>حراج</span>
          </button>
          <button type="button" className="publish-platform">
            <span>مستعمل</span>
          </button>
          <button type="button" className="publish-platform">
            <span>𝕏</span>
          </button>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noreferrer" className="publish-platform">
              <MessageCircle size={18} />
              <span>واتساب</span>
            </a>
          ) : (
            <button type="button" className="publish-platform" disabled>
              <MessageCircle size={18} />
              <span>واتساب</span>
            </button>
          )}
        </div>

        <button type="button" className="publish-approve-btn" onClick={onApprove}>
          <Check size={18} />
          راجع ووافق على النشر
        </button>
        <button type="button" className="publish-cancel" onClick={onClose}>
          لاحقاً
        </button>
      </div>
    </div>
  );
}

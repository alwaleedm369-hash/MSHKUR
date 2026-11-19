/**
 * بطاقة النشر الموحدة + موافقة بشرية
 * واتساب: wa.me فقط — بدون Meta Cloud API
 */
import { Check, MessageCircle } from 'lucide-react';
import { buildWaMeLink, getSavedWaNumber } from './whatsappShare';

type Props = {
  open: boolean;
  carTitle?: string;
  whatsappNumber?: string;
  publicUrl?: string;
  adText?: string;
  onApprove: () => void;
  onClose: () => void;
};

export default function PublishBottomSheet({
  open,
  carTitle = 'السيارة',
  whatsappNumber,
  publicUrl,
  adText,
  onApprove,
  onClose,
}: Props) {
  if (!open) return null;

  const phone = whatsappNumber || getSavedWaNumber();
  const text =
    adText?.trim() ||
    `مرحباً، أستفسر عن ${carTitle}${publicUrl ? '\n' + publicUrl : ''}`;
  const waLink = buildWaMeLink(phone, text);

  return (
    <div className="publish-sheet-overlay" onClick={onClose}>
      <div className="publish-sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="publish-sheet-handle" />
        <h3>تم تجهيز السيارة</h3>
        <p>راجع المحتوى ثم وافق. واتساب يفتح عبر الرابط الرسمي wa.me بدون اشتراك Meta.</p>

        <div className="publish-platforms">
          <button type="button" className="publish-platform" disabled title="قريباً مع مهارة تدريب بشري">
            حراج
          </button>
          <button type="button" className="publish-platform" disabled>
            مستعمل
          </button>
          <button type="button" className="publish-platform" disabled>
            𝕏
          </button>
          <a href={waLink} target="_blank" rel="noreferrer" className="publish-platform publish-wa">
            <MessageCircle size={18} /> واتساب
          </a>
        </div>

        <button
          type="button"
          className="publish-approve-btn"
          onClick={() => {
            onApprove();
            window.open(waLink, '_blank', 'noopener,noreferrer');
          }}
        >
          <Check size={18} /> راجع ووافق · افتح واتساب
        </button>
        <button type="button" className="publish-cancel" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </div>
  );
}

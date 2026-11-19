/**
 * ApprovalQueue — قائمة المراجعات (راجع ووافق)
 * مستوحاة من carAI/MSHKUR_Approval_List + Human-in-the-Loop
 */
import { useMemo, useState } from 'react';
import { Check, Eye, Trash2, ShieldCheck, Clock3 } from 'lucide-react';

export type ApprovalItem = {
  id: string;
  title: string;
  city?: string;
  price?: string | number;
  status: 'pending' | 'approved' | 'rejected';
  thumb?: string;
};

type Props = {
  items?: ApprovalItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReview?: (id: string) => void;
};

const DEMO: ApprovalItem[] = [
  { id: '1', title: 'تويوتا كامري 2022', city: 'الرياض', price: '85,000', status: 'pending' },
  { id: '2', title: 'هيونداي النترا 2021', city: 'جدة', price: '55,000', status: 'pending' },
];

export default function ApprovalQueue({ items, onApprove, onReject, onReview }: Props) {
  const [local, setLocal] = useState<ApprovalItem[]>(items?.length ? items : DEMO);
  const pending = useMemo(() => local.filter((i) => i.status === 'pending'), [local]);

  function approve(id: string) {
    setLocal((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'approved' } : i)));
    onApprove?.(id);
  }
  function reject(id: string) {
    setLocal((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'rejected' } : i)));
    onReject?.(id);
  }

  return (
    <section className="approval-queue" dir="rtl">
      <header className="aq-head">
        <div>
          <h2>المراجعات</h2>
          <p>لا يُنشر شيء دون موافقتك الصريحة</p>
        </div>
        <span className="aq-badge">
          <Clock3 size={14} /> {pending.length} بانتظار
        </span>
      </header>

      <div className="aq-trust">
        <ShieldCheck size={15} />
        راجع ووافق — Human-in-the-Loop
      </div>

      {local.length === 0 && <p className="aq-empty">لا توجد عناصر للمراجعة</p>}

      <ul className="aq-list">
        {local.map((item) => (
          <li key={item.id} className={`aq-card status-${item.status}`}>
            <div className="aq-card-main">
              <div className="aq-thumb">{item.thumb ? <img src={item.thumb} alt="" /> : <span>سيارة</span>}</div>
              <div>
                <b>{item.title}</b>
                <small>
                  {item.city || '—'}
                  {item.price ? ` · ${item.price} ريال` : ''}
                </small>
                <em>
                  {item.status === 'pending' && 'بانتظار الموافقة'}
                  {item.status === 'approved' && 'تمت الموافقة'}
                  {item.status === 'rejected' && 'مرفوض'}
                </em>
              </div>
            </div>
            {item.status === 'pending' && (
              <div className="aq-actions">
                <button type="button" className="aq-btn review" onClick={() => onReview?.(item.id)}>
                  <Eye size={14} /> مراجعة
                </button>
                <button type="button" className="aq-btn ok" onClick={() => approve(item.id)}>
                  <Check size={14} /> موافقة
                </button>
                <button type="button" className="aq-btn danger" onClick={() => reject(item.id)}>
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

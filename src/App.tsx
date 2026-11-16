import { useEffect, useState } from 'react';
import { Activity, ArrowUpLeft, CarFront, CheckCircle2, CircleHelp, Cloud, ImagePlus, LayoutGrid, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, Users, X } from 'lucide-react';

type Health = { status: string; service: string; version: string };
const nav = [
  { label: 'نظرة عامة', icon: LayoutGrid, active: true },
  { label: 'السيارات والمخزون', icon: CarFront },
  { label: 'استوديو الصور', icon: ImagePlus },
  { label: 'العملاء', icon: Users },
];
const tools = [
  { title: 'تجهيز صور السيارة', detail: 'خلفية نظيفة ومظهر موحّد', icon: ImagePlus, tone: 'violet' },
  { title: 'إدارة المخزون', detail: 'سياراتك وبياناتها في مكان واحد', icon: CarFront, tone: 'blue' },
  { title: 'إعداد الإعلان', detail: 'مسودة دقيقة من بيانات السيارة', icon: Sparkles, tone: 'amber' },
];
export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { fetch('/api/health').then(r => r.ok ? r.json() : Promise.reject()).then(setHealth).catch(() => setHealth(null)); }, []);
  return <div className="app-shell" dir="rtl">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">م</div><div><strong>مشكور</strong><small>مساحة عمل المعرض</small></div><button className="icon-button close-menu" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"><X size={18}/></button></div>
      <div className="workspace-label">مساحة العمل</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${item.active ? 'active' : ''}`}><item.icon size={18}/><span>{item.label}</span>{item.active && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>تحتاج إلى مساعدة؟</strong><p>نحن هنا لمساعدتك على إنجاز عملك.</p><button>مركز المساعدة <ArrowUpLeft size={14}/></button></div><button className="nav-item"><Settings2 size={18}/>الإعدادات</button><div className="profile"><div className="avatar">و</div><div><strong>مساحة المعرض</strong><small>الحساب الأساسي</small></div><button className="icon-button"><Menu size={17}/></button></div></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة"><Menu size={20}/></button><div className="breadcrumbs"><span>مساحة العمل</span><b>/</b><strong>نظرة عامة</strong></div><div className="top-actions"><div className="status"><span className={health ? 'status-dot' : 'status-dot offline'}/>{health ? 'الخادم يعمل' : 'تعذر الاتصال بالخادم'}</div><button className="icon-button" aria-label="بحث"><Search size={19}/></button><div className="avatar small">و</div></div></header>
      <div className="content">
        <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> مساحة عملك، ببساطة</div><h1>أهلاً بك في مشكور</h1><p>كل ما تحتاجه لإدارة سيارات معرضك وتجهيز إعلاناتها، في مكان واحد.</p></div><button className="primary-button"><Plus size={18}/> إضافة سيارة</button></section>
        <section className="hero-panel"><div className="hero-copy"><span className="hero-kicker">MSHKUR CARS</span><h2>من صور السيارة<br/>إلى إعلان جاهز.</h2><p>ابدأ بإضافة سيارة، ثم جهّز صورها وأنشئ إعلاناً من بياناتها الحقيقية.</p><button className="hero-button">ابدأ الآن <ArrowUpLeft size={16}/></button></div><div className="hero-art"><div className="art-glow"/><div className="car-illustration"><CarFront size={132} strokeWidth={0.8}/></div><div className="art-chip"><CheckCircle2 size={15}/> جاهز لتجهيز إعلانك</div></div></section>
        <section className="section-heading"><div><h3>ابدأ بإنجاز مهمة</h3><p>أدوات واضحة، ونتائج مباشرة.</p></div><button className="text-button">عرض جميع الأدوات <ArrowUpLeft size={15}/></button></section>
        <section className="tool-grid">{tools.map((tool, i) => <button className="tool-card" key={tool.title}><div className={`tool-icon ${tool.tone}`}><tool.icon size={22}/></div><div className="tool-card-text"><strong>{tool.title}</strong><span>{tool.detail}</span></div><ArrowUpLeft className="tool-arrow" size={17}/></button>)}</section>
        <section className="bottom-grid"><div className="empty-panel"><div className="panel-title"><div><h3>سياراتك</h3><p>تابع مخزون المعرض وإعلاناته.</p></div><span className="count-pill">0 سيارة</span></div><div className="empty-state"><div className="empty-icon"><CarFront size={25}/></div><strong>لا توجد سيارات بعد</strong><span>أضف أول سيارة لتبدأ تنظيم مخزونك.</span><button className="outline-button"><Plus size={16}/> إضافة أول سيارة</button></div></div><div className="trust-panel"><div className="trust-icon"><ShieldCheck size={21}/></div><h3>بياناتك تحت سيطرتك</h3><p>لن ننشر إعلاناً أو نرسل رسالة أو نشارك بياناتك دون موافقتك.</p><div className="trust-foot"><Activity size={15}/> <span>حالة النظام</span><strong>{health ? 'متصل' : 'بانتظار الخادم'}</strong></div><div className="trust-foot"><Cloud size={15}/> <span>حفظ البيانات</span><strong>سيتم تفعيله بعد ربط قاعدة البيانات</strong></div></div></section>
        <footer>مشكور © {new Date().getFullYear()} <span>صُمّم ليجعل عملك أسهل.</span></footer>
      </div>
    </main>
  </div>;
}

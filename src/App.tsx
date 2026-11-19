/**
 * MSHKUR App — commercial mobile-first entry
 * GuestLanding + CarAdWorkflow + ApprovalQueue + HarajPublishPanel + Admin
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import './mobile-polish.css';
import { OperationsPanel, GrowthPanel, InboxPanel } from './Operations';
import PublicShowroom from './PublicShowroom';
import GuestStudio from './GuestStudio';
import DashboardHome from './DashboardHome';
import AssetHistoryPanel from './AssetHistoryPanel';
import OfflineAdKit from './OfflineAdKit';
import { SkillsPanel, TasksPanel } from './WorkCenter';
import GuestLanding from './GuestLanding';
import CommercialShell from './CommercialShell';
import CarAdWorkflow from './CarAdWorkflow';
import ApprovalQueue from './ApprovalQueue';
import HarajPublishPanel from './HarajPublishPanel';
import AdminControlsPanel from './AdminControlsPanel';
import {
  CarFront, LayoutDashboard, ListTodo, LogOut, Menu, MessageCircle,
  Settings2, Sparkles, WandSparkles, X, Blocks, LoaderCircle
} from 'lucide-react';

type User = {
  id: string; tenantId: string; tenantName: string; tenantSlug?: string;
  tenantType?: string; name: string; email: string; role: string;
};
type Vehicle = {
  id: string; make: string; model: string; trim?: string | null;
  year?: number | null; mileage?: number | null; fuel?: string | null;
  transmission?: string | null; color?: string | null; price?: number | null;
  city?: string | null; notes?: string | null; status: string;
};
type Screen = 'home' | 'cars' | 'studio' | 'assistant' | 'growth' | 'inbox' | 'admin' | 'skills' | 'tasks' | 'approvals' | 'haraj';

async function api<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || 'تعذر تنفيذ الطلب');
  return body as T;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [guestMode, setGuestMode] = useState(true);
  const [adWorkflowOpen, setAdWorkflowOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishMeta, setPublishMeta] = useState<{ title?: string; draft?: string }>({});
  const [quickTool, setQuickTool] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [auth, setAuth] = useState({
    name: '', tenantName: 'معرضي', tenantType: 'dealer', email: '', password: '',
  });
  const [screen, setScreen] = useState<Screen>('home');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiFloatVisible, setAiFloatVisible] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const loadVehicles = useCallback(async () => {
    const data = await api<{ vehicles: Vehicle[] }>('/api/vehicles');
    setVehicles(data.vehicles);
  }, []);

  useEffect(() => {
    api<{ user: User }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) loadVehicles().catch((e) => setError(e.message));
  }, [user, loadVehicles]);

  async function submitAuth(e: FormEvent) {
    e.preventDefault();
    setError('');
    setAuthBusy(true);
    try {
      const body = authMode === 'register' ? auth : { email: auth.email, password: auth.password };
      const data = await api<{ user: User }>('/api/auth/' + authMode, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setUser(data.user);
      setMessage(authMode === 'register' ? 'تم إنشاء مساحة معرضك.' : 'مرحباً بعودتك.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول');
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setVehicles([]);
    setScreen('home');
    setGuestMode(true);
  }

  if (loading) {
    return (
      <div className="auth-shell" dir="rtl" style={{ placeItems: 'center', minHeight: '100vh' }}>
        <LoaderCircle className="spin" size={28} />
      </div>
    );
  }

  if (adWorkflowOpen && !user) {
    return (
      <CommercialShell
        aiFloatVisible={aiFloatVisible}
        whatsappNumber={whatsappNumber}
        publishOpen={publishOpen}
        onPublishClose={() => setPublishOpen(false)}
        onPublishApprove={() => setPublishOpen(false)}
        carTitle={publishMeta.title}
      >
        <CarAdWorkflow
          onBack={() => {
            setAdWorkflowOpen(false);
            setGuestMode(true);
          }}
          onRequestPublish={(payload) => {
            setPublishMeta({ title: payload.title, draft: payload.draft });
            setPublishOpen(true);
          }}
        />
      </CommercialShell>
    );
  }

  if (guestMode && !user) {
    return (
      <GuestLanding
        onStartStudio={() => {
          setAdWorkflowOpen(true);
          setGuestMode(false);
        }}
        onRegister={() => {
          setGuestMode(false);
          setAuthMode('register');
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="auth-shell" dir="rtl">
        <div className="auth-brand">
          <div className="brand-symbol">م</div>
          <span>مشكور</span>
          <small>مساحة عملك الذكية</small>
        </div>
        <div className="auth-card" style={{ maxWidth: 420, margin: '40px auto' }}>
          <div className="auth-card-head">
            <span>{authMode === 'register' ? 'ابدأ مجاناً' : 'مرحباً بعودتك'}</span>
            <h2>{authMode === 'register' ? 'إنشاء مساحة معرض' : 'تسجيل الدخول'}</h2>
          </div>
          <form onSubmit={submitAuth} className="auth-form">
            {authMode === 'register' && (
              <>
                <label>اسمك<input value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} required /></label>
                <label>اسم المعرض<input value={auth.tenantName} onChange={(e) => setAuth({ ...auth, tenantName: e.target.value })} required /></label>
              </>
            )}
            <label>البريد<input type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required /></label>
            <label>كلمة المرور<input type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required /></label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={authBusy}>{authBusy ? '...' : authMode === 'register' ? 'إنشاء' : 'دخول'}</button>
          </form>
          <button type="button" className="linkish" onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}>
            {authMode === 'register' ? 'لديك حساب؟ دخول' : 'حساب جديد'}
          </button>
          <button type="button" className="linkish" onClick={() => setGuestMode(true)}>العودة للأداة</button>
        </div>
      </div>
    );
  }

  return (
    <CommercialShell
      aiFloatVisible={aiFloatVisible}
      whatsappNumber={whatsappNumber}
      publishOpen={publishOpen}
      onPublishClose={() => setPublishOpen(false)}
      onPublishApprove={() => setPublishOpen(false)}
      carTitle={publishMeta.title}
    >
      <div className="app-shell" dir="rtl">
        <header className="topbar">
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="القائمة"><Menu size={20} /></button>
          <strong>{user.tenantName}</strong>
          <button type="button" onClick={logout} aria-label="خروج"><LogOut size={18} /></button>
        </header>

        {message && <div className="toast ok">{message}</div>}
        {error && <div className="toast err">{error}</div>}

        <main className="main-pane">
          {screen === 'home' && <DashboardHome userName={user.name} onOpenStudio={() => setScreen('studio')} />}
          {screen === 'studio' && (
            quickTool ? <GuestStudio onDone={() => setQuickTool(false)} /> : <GuestStudio />
          )}
          {screen === 'cars' && (
            <section className="panel">
              <h2><CarFront size={18} /> السيارات ({vehicles.length})</h2>
              <ul className="vehicle-list">
                {vehicles.map((v) => (
                  <li key={v.id}>{v.make} {v.model} {v.year || ''}</li>
                ))}
              </ul>
              {vehicles[0] && <OfflineAdKit vehicleId={vehicles[0].id} />}
            </section>
          )}
          {screen === 'skills' && <SkillsPanel />}
          {screen === 'tasks' && <TasksPanel />}
          {screen === 'growth' && <GrowthPanel />}
          {screen === 'inbox' && <InboxPanel />}
          {screen === 'approvals' && (
            <ApprovalQueue
              onApprove={(id) => setMessage('تمت الموافقة على #' + id)}
              onReject={(id) => setMessage('تم رفض #' + id)}
            />
          )}
          {screen === 'haraj' && (
            <HarajPublishPanel
              vehicles={vehicles.map((v) => ({
                id: v.id,
                title: `${v.make} ${v.model}${v.year ? ' ' + v.year : ''}`,
                price: v.price != null ? String(v.price) : undefined,
                city: v.city || undefined,
              }))}
              onApprovedPublish={(p) => {
                setPublishMeta({ title: p.title, draft: p.description });
                setPublishOpen(true);
                setMessage('تمت الموافقة — اختر قناة النشر');
              }}
            />
          )}
          {screen === 'admin' && (
            <div>
              <div style={{ display: 'flex', gap: 8, padding: '12px 16px', flexWrap: 'wrap' }}>
                <button type="button" className="caw-btn primary" onClick={() => setScreen('approvals')}>المراجعات</button>
                <button type="button" className="caw-btn ghost" onClick={() => setScreen('haraj')}>نشر حراج</button>
                <button type="button" className="caw-btn ghost" onClick={() => setAdWorkflowOpen(true)}>تجهيز إعلان</button>
              </div>
              <AdminControlsPanel
                aiFloatVisible={aiFloatVisible}
                onAiFloatChange={setAiFloatVisible}
                whatsappNumber={whatsappNumber}
                onWhatsappChange={setWhatsappNumber}
              />
            </div>
          )}
          {screen === 'assistant' && (
            <section className="panel">
              <h2><MessageCircle size={18} /> المساعد</h2>
              <p>استخدم الزر العائم أو ابدأ من أداة تجهيز الإعلان.</p>
              <button type="button" className="gl-btn-primary" onClick={() => setAdWorkflowOpen(true)}>
                <WandSparkles size={16} /> تجهيز إعلان سيارة
              </button>
            </section>
          )}
        </main>

        <nav className="bottom-nav">
          <button type="button" className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><LayoutDashboard size={18} /><span>الرئيسية</span></button>
          <button type="button" className={screen === 'studio' ? 'active' : ''} onClick={() => setScreen('studio')}><WandSparkles size={18} /><span>الاستوديو</span></button>
          <button type="button" className={screen === 'cars' ? 'active' : ''} onClick={() => setScreen('cars')}><CarFront size={18} /><span>السيارات</span></button>
          <button type="button" className={screen === 'tasks' || screen === 'approvals' ? 'active' : ''} onClick={() => setScreen('approvals')}><ListTodo size={18} /><span>مراجعات</span></button>
          <button type="button" className={screen === 'admin' ? 'active' : ''} onClick={() => setScreen('admin')}><Settings2 size={18} /><span>إدارة</span></button>
        </nav>
      </div>
    </CommercialShell>
  );
}

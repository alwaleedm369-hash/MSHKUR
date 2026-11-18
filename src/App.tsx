/**
 * MSHKUR App — commercial mobile-first entry
 * GuestLanding + CommercialShell + AdminControls + full workspace wiring
 * Branch: docs/mobile-and-commercial-launch
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { OperationsPanel, GrowthPanel, InboxPanel } from './Operations';
import PublicShowroom from './PublicShowroom';
import GuestStudio from './GuestStudio';
import DashboardHome from './DashboardHome';
import AssetHistoryPanel from './AssetHistoryPanel';
import OfflineAdKit from './OfflineAdKit';
import { SkillsPanel, TasksPanel } from './WorkCenter';
import GuestLanding from './GuestLanding';
import CommercialShell from './CommercialShell';
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
type Screen = 'home' | 'cars' | 'studio' | 'assistant' | 'growth' | 'inbox' | 'admin' | 'skills' | 'tasks';

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
  const [quickTool, setQuickTool] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [auth, setAuth] = useState({
    name: '', tenantName: 'معرضي', tenantType: 'dealer', email: '', password: '',
  });
  const [screen, setScreen] = useState<Screen>('home');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<any[]>([]);
  const [assetVehicleId, setAssetVehicleId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiFloatVisible, setAiFloatVisible] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(
    () => localStorage.getItem('mshkur_wa') || ''
  );
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '', model: '', trim: '', year: '', mileage: '', fuel: '',
    transmission: '', color: '', price: '', city: 'جدة', notes: '',
  });
  const [busy, setBusy] = useState(false);

  const loadVehicles = useCallback(async () => {
    const data = await api<{ vehicles: Vehicle[] }>('/api/vehicles');
    setVehicles(data.vehicles);
  }, []);

  const loadVehicleAssets = useCallback(async (vehicleId: string) => {
    if (!vehicleId) { setVehicleAssets([]); return; }
    const data = await api<{ assets: any[] }>(`/api/vehicles/${vehicleId}/assets`);
    setVehicleAssets(data.assets);
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

  useEffect(() => {
    if (vehicles.length && !assetVehicleId) setAssetVehicleId(vehicles[0].id);
  }, [vehicles, assetVehicleId]);

  useEffect(() => {
    if (assetVehicleId) loadVehicleAssets(assetVehicleId).catch((e) => setError(e.message));
  }, [assetVehicleId, loadVehicleAssets]);

  async function submitAuth(e: FormEvent) {
    e.preventDefault();
    setError('');
    setAuthBusy(true);
    try {
      const body = authMode === 'register' ? auth : { email: auth.email, password: auth.password };
      const data = await api<{ user: User }>(`/api/auth/${authMode}`, {
        method: 'POST', body: JSON.stringify(body),
      });
      setUser(data.user);
      setGuestMode(false);
      setMessage(authMode === 'register' ? 'تم إنشاء مساحة معرضك بنجاح.' : 'مرحباً بعودتك.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول');
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null); setVehicles([]); setScreen('home'); setGuestMode(true);
  }

  async function addVehicle(e: FormEvent) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const payload = {
        ...newVehicle,
        year: newVehicle.year ? Number(newVehicle.year) : undefined,
        mileage: newVehicle.mileage ? Number(newVehicle.mileage) : undefined,
        price: newVehicle.price ? Number(newVehicle.price) : undefined,
      };
      const created = await api<{ vehicle: Vehicle }>('/api/vehicles', {
        method: 'POST', body: JSON.stringify(payload),
      });
      await loadVehicles();
      setAssetVehicleId(created.vehicle.id);
      setShowVehicleForm(false);
      setNewVehicle({ make: '', model: '', trim: '', year: '', mileage: '', fuel: '', transmission: '', color: '', price: '', city: 'جدة', notes: '' });
      setMessage('تم حفظ السيارة. يمكنك رفع الصور من الاستوديو.');
      setScreen('studio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ السيارة');
    } finally {
      setBusy(false);
    }
  }

  const publicSlug = window.location.pathname.match(/^\/s\/([a-z0-9\p{L}-]+)\/?$/iu)?.[1];
  if (publicSlug) return <PublicShowroom slug={decodeURIComponent(publicSlug)} />;

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="brand-symbol">م</div>
        <span>مشكور</span>
        <div className="boot-loader" />
      </div>
    );
  }

  if (quickTool && !user) {
    return (
      <GuestStudio onAccount={() => { setQuickTool(false); setGuestMode(false); setAuthMode('register'); }} />
    );
  }

  if (guestMode && !user) {
    return (
      <GuestLanding
        onStartStudio={() => { setGuestMode(false); setQuickTool(true); }}
        onRegister={() => { setGuestMode(false); setAuthMode('register'); }}
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
                <label>اسمك<input required minLength={2} value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} /></label>
                <label>اسم المعرض<input required value={auth.tenantName} onChange={(e) => setAuth({ ...auth, tenantName: e.target.value })} /></label>
              </>
            )}
            <label>البريد الإلكتروني<input required type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} /></label>
            <label>كلمة المرور<input required type="password" minLength={12} value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} /></label>
            {error && <div className="inline-error">{error}</div>}
            <button className="button-primary auth-submit" disabled={authBusy}>
              {authBusy ? <LoaderCircle className="spin" size={16} /> : null}
              {authMode === 'register' ? 'إنشاء الحساب' : 'دخول'}
            </button>
          </form>
          <div className="auth-switch">
            {authMode === 'register' ? (
              <>لديك حساب؟ <button type="button" onClick={() => setAuthMode('login')}>سجّل الدخول</button></>
            ) : (
              <>جديد؟ <button type="button" onClick={() => setAuthMode('register')}>أنشئ مساحة</button></>
            )}
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'cars', label: 'السيارات', icon: CarFront },
    { id: 'studio', label: 'الاستوديو', icon: WandSparkles },
    { id: 'skills', label: 'المهارات', icon: Blocks },
    { id: 'tasks', label: 'المهام', icon: ListTodo },
    { id: 'admin', label: 'الإدارة', icon: Settings2 },
  ];

  return (
    <CommercialShell
      aiFloatVisible={aiFloatVisible}
      whatsappNumber={whatsappNumber}
      publishOpen={publishOpen}
      onPublishClose={() => setPublishOpen(false)}
      onPublishApprove={() => { setMessage('تمت الموافقة على النشر.'); setPublishOpen(false); }}
      onAssistantSend={async (text) => {
        try {
          const plan = await api('/api/assistant/plan', { method: 'POST', body: JSON.stringify({ request: text }) });
          return plan?.summary || plan?.message || 'تم تحليل الطلب.';
        } catch {
          return 'تعذر الاتصال بالمساعد حالياً.';
        }
      }}
    >
      <div className="workspace" dir="rtl">
        <aside className={`side-nav ${menuOpen ? 'side-nav-open' : ''}`}>
          <div className="side-brand">
            <div className="brand-symbol">م</div>
            <div><b>مشكور</b><small>MSHKUR</small></div>
            <button className="side-close" onClick={() => setMenuOpen(false)}><X size={18} /></button>
          </div>
          <div className="workspace-switch">
            <div className="workspace-avatar">{user.name[0]}</div>
            <div><b>{user.tenantName}</b><small>{user.name}</small></div>
          </div>
          <nav>
            {navItems.map((item) => (
              <button key={item.id} className={`side-link ${screen === item.id ? 'selected' : ''}`}
                onClick={() => { setScreen(item.id); setMenuOpen(false); }}>
                <item.icon size={16} />{item.label}
              </button>
            ))}
          </nav>
          <div className="side-spacer" />
          <button className="side-link muted-link" onClick={logout}><LogOut size={16} /> خروج</button>
        </aside>
        {menuOpen && <button className="nav-scrim" onClick={() => setMenuOpen(false)} />}

        <main className="work-main">
          <header className="work-topbar">
            <button className="mobile-nav-trigger" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
            <div className="crumb"><strong>{navItems.find((n) => n.id === screen)?.label || 'الرئيسية'}</strong></div>
            <div className="topbar-right">
              <span className="local-indicator"><i /> محلي</span>
              <button className="top-icon" onClick={() => setPublishOpen(true)} title="النشر"><MessageCircle size={18} /></button>
            </div>
          </header>

          <div className="page-content">
            {message && <div className="toast">{message}<button onClick={() => setMessage('')}>×</button></div>}
            {error && <div className="toast toast-error">{error}<button onClick={() => setError('')}>×</button></div>}

            {screen === 'home' && (
              <DashboardHome name={user.name} vehicles={vehicles} assets={vehicleAssets}
                onAddVehicle={() => { setShowVehicleForm(true); setScreen('cars'); }}
                onStudio={() => setScreen('studio')} onAssistant={() => setScreen('assistant')} onCars={() => setScreen('cars')} />
            )}

            {screen === 'cars' && (
              <>
                <section className="page-intro">
                  <div><div className="overline"><span /> سجل موحد</div><h1>السيارات والإعلانات</h1></div>
                  <button className="button-primary" onClick={() => setShowVehicleForm(true)}>سيارة جديدة</button>
                </section>
                {showVehicleForm && (
                  <form className="form-panel" onSubmit={addVehicle}>
                    <div className="form-heading">
                      <div><b>بيانات السيارة</b><small>املأ الأساسيات ثم احفظ</small></div>
                      <button type="button" onClick={() => setShowVehicleForm(false)}><X size={16} /></button>
                    </div>
                    <div className="form-grid">
                      <label>الماركة<input required value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} /></label>
                      <label>الموديل<input required value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} /></label>
                      <label>السنة<input value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} /></label>
                      <label>السعر<input value={newVehicle.price} onChange={(e) => setNewVehicle({ ...newVehicle, price: e.target.value })} /></label>
                      <label>المدينة<input value={newVehicle.city} onChange={(e) => setNewVehicle({ ...newVehicle, city: e.target.value })} /></label>
                    </div>
                    <div className="form-actions">
                      <button className="button-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : null} حفظ السيارة</button>
                    </div>
                  </form>
                )}
                {vehicles.length === 0 ? (
                  <div className="empty-inventory">
                    <div className="empty-car"><CarFront size={27} /></div>
                    <b>مخزونك فارغ حالياً</b><span>أضف أول سيارة لبدء التجهيز</span>
                  </div>
                ) : (
                  <div className="vehicle-grid">
                    {vehicles.map((v) => (
                      <article key={v.id} className="vehicle-card">
                        <div className="vehicle-card-art"><CarFront size={40} /><span>{v.status || 'مسودة'}</span></div>
                        <div className="vehicle-card-body">
                          <b>{[v.year, v.make, v.model].filter(Boolean).join(' ')}</b>
                          <small>{[v.city, v.mileage ? `${v.mileage} كم` : null].filter(Boolean).join(' · ') || 'بيانات أولية'}</small>
                          <div className="vehicle-card-bottom">
                            <strong>{v.price ? new Intl.NumberFormat('ar-SA').format(v.price) + ' ر.س' : 'السعر غير محدد'}</strong>
                            <button onClick={() => { setAssetVehicleId(v.id); setScreen('studio'); }}>تجهيز</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {screen === 'studio' && (
              <>
                <section className="page-intro">
                  <div><div className="overline"><span /> معالجة محلية</div><h1>استوديو الصور</h1><p>ارفع صوراً، أزل الخلفية، جهّز الإعلان</p></div>
                  <button className="button-primary" onClick={() => setPublishOpen(true)}>جاهز للنشر؟</button>
                </section>
                {assetVehicleId ? (
                  <AssetHistoryPanel assets={vehicleAssets} onOpen={(id) => { setMessage('فتح الأصل ' + id); }} />
                ) : (
                  <div className="empty-inventory"><b>اختر سيارة أولاً من قائمة السيارات</b></div>
                )}
                {(() => {
                  const v = vehicles.find(x => x.id === assetVehicleId);
                  return v ? <OfflineAdKit vehicle={v} assets={vehicleAssets} /> : null;
                })()}
              </>
            )}

            {screen === 'skills' && <SkillsPanel />}
            {screen === 'tasks' && <TasksPanel />}
            {screen === 'growth' && <GrowthPanel />}
            {screen === 'inbox' && <InboxPanel />}
            {screen === 'assistant' && (
              <section className="assistant-panel">
                <div className="assistant-avatar"><Sparkles size={20} /></div>
                <div className="assistant-greeting"><b>مساعد مشكور</b><p>استخدم الزر العائم أو اطلب مهمة من هنا</p></div>
              </section>
            )}

            {screen === 'admin' && (user.role === 'owner' || user.role === 'admin') && (
              <>
                <AdminControlsPanel
                  aiFloatVisible={aiFloatVisible}
                  onToggleAiFloat={setAiFloatVisible}
                  whatsappNumber={whatsappNumber}
                  onSaveWhatsapp={(n) => { setWhatsappNumber(n); localStorage.setItem('mshkur_wa', n); }}
                />
                <OperationsPanel />
              </>
            )}

            <footer className="page-footer">
              مشكور <span>مساحة عمل بسيطة، ونتائج حقيقية.</span>
              <span className="version-label">BUILD commercial-0.4</span>
            </footer>
          </div>
        </main>
      </div>
    </CommercialShell>
  );
}

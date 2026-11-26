import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, Users, Package, BarChart3, Megaphone, MessageSquare, Plus, Search,
  Trash2, MapPin, Phone, Mail, Globe, Save, X, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';
import { useDealerWorkspace, setAdPrefillFromVehicle, DealerVehicle } from '@shared/stores/workspaceStore';

type TabId = 'dashboard' | 'inventory' | 'customers' | 'marketing' | 'profile';

export const DealerPortal = () => {
  const { locale } = useLocaleTheme();
  const isAr = locale === 'ar';
  const navigate = useNavigate();
  const {
    vehicles,
    customers,
    profile,
    drafts,
    addVehicle,
    updateVehicleStatus,
    deleteVehicle,
    addCustomer,
    updateCustomerStatus,
    setProfile,
  } = useDealerWorkspace();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [notice, setNotice] = useState('');

  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: String(new Date().getFullYear()),
    trim: '',
    price: '',
    mileage: '',
    color: '',
    fuelType: 'gasoline',
    transmission: 'automatic',
    vin: '',
    description: '',
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    interestedCar: '',
    lastMessage: '',
  });

  const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: 'dashboard', label: isAr ? 'لوحة التحكم' : 'Overview', icon: BarChart3 },
    { id: 'inventory', label: isAr ? 'المخزون' : 'Inventory', icon: Package },
    { id: 'customers', label: isAr ? 'العملاء' : 'Leads & CRM', icon: Users },
    { id: 'marketing', label: isAr ? 'التسويق' : 'Campaigns', icon: Megaphone },
    { id: 'profile', label: isAr ? 'ملف المعرض' : 'Showroom Profile', icon: Store },
  ];

  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const soldCount = vehicles.filter(v => v.status === 'sold').length;
  const openLeadsCount = customers.filter(c => c.status === 'new' || c.status === 'pending').length;

  const filteredVehicles = vehicles.filter(v => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      String(v.year).includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.make.trim() || !newVehicle.model.trim()) return;
    addVehicle({
      make: newVehicle.make.trim(),
      model: newVehicle.model.trim(),
      year: Number(newVehicle.year) || new Date().getFullYear(),
      trim: newVehicle.trim.trim(),
      price: Number(newVehicle.price) || 0,
      mileage: Number(newVehicle.mileage) || 0,
      color: newVehicle.color.trim() || 'White',
      fuelType: newVehicle.fuelType,
      transmission: newVehicle.transmission,
      vin: newVehicle.vin.trim(),
      description: newVehicle.description.trim(),
      status: 'available',
      imagesCount: 0,
    });
    setNewVehicle({
      make: '',
      model: '',
      year: String(new Date().getFullYear()),
      trim: '',
      price: '',
      mileage: '',
      color: '',
      fuelType: 'gasoline',
      transmission: 'automatic',
      vin: '',
      description: '',
    });
    setShowAddVehicle(false);
    setNotice(isAr ? 'تمت إضافة المركبة إلى المخزون.' : 'Vehicle added to showroom inventory.');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;
    addCustomer({
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      interestedCar: newCustomer.interestedCar.trim() || 'General Inquiry',
      lastMessage: newCustomer.lastMessage.trim() || 'Requested details',
      status: 'new',
    });
    setNewCustomer({ name: '', phone: '', interestedCar: '', lastMessage: '' });
    setShowAddCustomer(false);
    setNotice(isAr ? 'تم تسجيل العميل في قائمة المتابعة.' : 'Lead added to CRM queue.');
  };

  const handleCreateAdFromVehicle = (vehicle: DealerVehicle) => {
    setAdPrefillFromVehicle(vehicle);
    navigate('/ad-studio');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileForm);
    setNotice(isAr ? 'تم حفظ بيانات المعرض.' : 'Showroom profile updated.');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white/95 dark:bg-surface-900/95 border-b border-surface-200 dark:border-surface-800 px-4 py-3">
        <div className="container-mshkur flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? profile.nameAr : profile.nameEn}
              </h1>
              <p className="text-body-xs text-surface-500">
                {isAr ? 'مساحة عمل المعرض والمخزون والعملاء' : 'Dealer Workspace • Inventory, Leads & Campaigns'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddVehicle(true)}
            className="btn btn-primary gap-1.5 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? 'إضافة سيارة' : 'Add Vehicle'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 py-2 overflow-x-auto">
        <div className="container-mshkur flex items-center gap-2 min-w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-body-xs font-medium min-h-[44px] transition-colors',
                  activeTab === t.id
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <div className="container-mshkur pt-4 px-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-body-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {notice}
            </span>
            <button type="button" onClick={() => setNotice('')} className="underline text-xs">
              {isAr ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      <div className="container-mshkur flex-1 py-6 px-4 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card p-5">
                <p className="text-body-xs text-surface-500">{isAr ? 'سيارات متاحة' : 'Available Vehicles'}</p>
                <p className="text-heading-xl font-bold text-surface-900 dark:text-white mt-1">{availableCount}</p>
              </div>
              <div className="card p-5">
                <p className="text-body-xs text-surface-500">{isAr ? 'مسودات الإعلانات' : 'Ad Drafts'}</p>
                <p className="text-heading-xl font-bold text-surface-900 dark:text-white mt-1">{drafts.length}</p>
              </div>
              <div className="card p-5">
                <p className="text-body-xs text-surface-500">{isAr ? 'استفسارات مفتوحة' : 'Open Leads'}</p>
                <p className="text-heading-xl font-bold text-surface-900 dark:text-white mt-1">{openLeadsCount}</p>
              </div>
              <div className="card p-5">
                <p className="text-body-xs text-surface-500">{isAr ? 'سيارات مباعة' : 'Sold Vehicles'}</p>
                <p className="text-heading-xl font-bold text-surface-900 dark:text-white mt-1">{soldCount}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                    {isAr ? 'أحدث مركبات المخزون' : 'Recent Inventory'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="text-body-xs text-brand-600 font-medium"
                  >
                    {isAr ? 'عرض الكل' : 'View All'}
                  </button>
                </div>
                {vehicles.slice(0, 4).map(v => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-white">
                        {v.year} {v.make} {v.model} {v.trim}
                      </p>
                      <p className="text-body-xs text-surface-500">
                        {v.price.toLocaleString()} SAR • {v.mileage.toLocaleString()} km
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCreateAdFromVehicle(v)}
                      className="btn btn-secondary btn-sm gap-1 min-h-[36px]"
                    >
                      <span>{isAr ? 'إنشاء إعلان' : 'Create Ad'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                    {isAr ? 'استفسارات العملاء' : 'Recent Buyer Inquiries'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('customers')}
                    className="text-body-xs text-brand-600 font-medium"
                  >
                    {isAr ? 'إدارة العملاء' : 'Manage CRM'}
                  </button>
                </div>
                {customers.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-white">{c.name}</p>
                      <p className="text-body-xs text-surface-500">
                        {c.interestedCar} — {c.lastMessage}
                      </p>
                    </div>
                    <span className="badge badge-neutral uppercase">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="h-4 w-4 text-surface-400 absolute top-1/2 -translate-y-1/2 start-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بالشركة أو الموديل أو السنة...' : 'Search make, model, or year...'}
                  className="input ps-9 min-h-[44px]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(['all', 'available', 'reserved', 'sold'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-body-xs font-medium capitalize min-h-[40px]',
                      statusFilter === st
                        ? 'bg-brand-600 text-white'
                        : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map(v => (
                <div key={v.id} className="card p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                        {v.year} {v.make} {v.model} {v.trim}
                      </h3>
                      <span className="badge badge-primary uppercase">{v.status}</span>
                    </div>
                    <p className="text-heading-md font-bold text-brand-600">
                      {v.price.toLocaleString()} SAR
                    </p>
                    <p className="text-body-xs text-surface-500">
                      {v.mileage.toLocaleString()} km • {v.color} • {v.transmission}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex flex-wrap items-center justify-between gap-2">
                    <select
                      value={v.status}
                      onChange={e =>
                        updateVehicleStatus(v.id, e.target.value as DealerVehicle['status'])
                      }
                      aria-label="Vehicle status"
                      className="input py-1.5 px-2.5 text-body-xs w-auto min-h-[36px]"
                    >
                      <option value="available">{isAr ? 'متاحة' : 'Available'}</option>
                      <option value="reserved">{isAr ? 'محجوزة' : 'Reserved'}</option>
                      <option value="sold">{isAr ? 'مباعة' : 'Sold'}</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCreateAdFromVehicle(v)}
                        className="btn btn-primary btn-sm gap-1 min-h-[36px]"
                      >
                        <Megaphone className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إعلان' : 'Ad'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVehicle(v.id)}
                        className="btn-icon p-2 text-surface-400 hover:text-red-600"
                        aria-label="Delete vehicle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? 'سجل العملاء والاستفسارات' : 'Buyer Leads & Follow-Ups'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddCustomer(true)}
                className="btn btn-primary gap-1.5 min-h-[44px]"
              >
                <Plus className="h-4 w-4" />
                <span>{isAr ? 'عميل جديد' : 'Add Lead'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {customers.map(c => (
                <div
                  key={c.id}
                  className="card p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-surface-900 dark:text-white">{c.name}</span>
                      {c.phone && (
                        <span className="text-body-xs text-surface-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-body-xs text-brand-600 font-medium">{c.interestedCar}</p>
                    <p className="text-body-xs text-surface-600 dark:text-surface-400 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {c.lastMessage}
                    </p>
                  </div>

                  <select
                    value={c.status}
                    onChange={e =>
                      updateCustomerStatus(c.id, e.target.value as typeof c.status)
                    }
                    className="input w-auto min-h-[40px] text-body-xs"
                  >
                    <option value="new">{isAr ? 'جديد' : 'New'}</option>
                    <option value="pending">{isAr ? 'قيد المتابعة' : 'Pending'}</option>
                    <option value="replied">{isAr ? 'تم الرد' : 'Replied'}</option>
                    <option value="closed">{isAr ? 'مغلق' : 'Closed'}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                  {isAr ? 'حملات الإعلانات المرتبطة' : 'Connected Listing Campaigns'}
                </h2>
                <p className="text-body-xs text-surface-500">
                  {isAr
                    ? 'اختر أي مركبة من المخزون لإنشاء مسودة إعلان معتمدة في استوديو الإعلانات.'
                    : 'Launch approval-gated listing drafts directly from your active inventory.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ad-studio')}
                className="btn btn-primary gap-1.5 min-h-[44px]"
              >
                <Megaphone className="h-4 w-4" />
                <span>{isAr ? 'فتح استوديو الإعلانات' : 'Open Ad Studio'}</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {drafts.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800">
                  <p className="text-body-sm font-semibold text-surface-900 dark:text-white">
                    {d.title || `${d.year} ${d.make} ${d.model}`}
                  </p>
                  <p className="text-body-xs text-surface-500 mt-1">
                    {isAr ? 'الحالة:' : 'Status:'} {d.status} • {d.platforms.join(', ')}
                  </p>
                </div>
              ))}
              {drafts.length === 0 && (
                <p className="text-body-sm text-surface-500">
                  {isAr ? 'لا توجد مسودات إعلانات نشطة حالياً.' : 'No active listing drafts yet.'}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="card p-6 space-y-4 max-w-2xl">
            <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
              {isAr ? 'بيانات وهوية المعرض' : 'Showroom Identity & Contact'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{isAr ? 'اسم المعرض (عربي)' : 'Showroom Name (Arabic)'}</label>
                <input
                  type="text"
                  value={profileForm.nameAr}
                  onChange={e => setProfileForm({ ...profileForm, nameAr: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
              <div>
                <label className="label">{isAr ? 'اسم المعرض (إنجليزي)' : 'Showroom Name (English)'}</label>
                <input
                  type="text"
                  value={profileForm.nameEn}
                  onChange={e => setProfileForm({ ...profileForm, nameEn: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {isAr ? 'رقم الهاتف' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {isAr ? 'الموقع الإلكتروني' : 'Website'}
                </label>
                <input
                  type="text"
                  value={profileForm.website}
                  onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
              <div>
                <label className="label">{isAr ? 'السجل التجاري' : 'Commercial Registration'}</label>
                <input
                  type="text"
                  value={profileForm.crNumber}
                  onChange={e => setProfileForm({ ...profileForm, crNumber: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {isAr ? 'العنوان' : 'Address'}
              </label>
              <input
                type="text"
                value={isAr ? profileForm.addressAr : profileForm.addressEn}
                onChange={e =>
                  setProfileForm(
                    isAr
                      ? { ...profileForm, addressAr: e.target.value }
                      : { ...profileForm, addressEn: e.target.value }
                  )
                }
                className="input min-h-[44px]"
              />
            </div>
            <button type="submit" className="btn btn-primary gap-1.5 min-h-[44px]">
              <Save className="h-4 w-4" />
              <span>{isAr ? 'حفظ التغييرات' : 'Save Profile'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddVehicle(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateVehicle}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-surface-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-heading-md font-bold">{isAr ? 'إضافة مركبة جديدة' : 'Add Vehicle to Inventory'}</h2>
              <button type="button" onClick={() => setShowAddVehicle(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder={isAr ? 'الشركة (مثال: تويوتا)' : 'Make (e.g. Toyota)'}
                value={newVehicle.make}
                onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })}
                className="input min-h-[44px]"
              />
              <input
                required
                placeholder={isAr ? 'الموديل (مثال: كامري)' : 'Model (e.g. Camry)'}
                value={newVehicle.model}
                onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                className="input min-h-[44px]"
              />
              <input
                placeholder={isAr ? 'السنة' : 'Year'}
                value={newVehicle.year}
                onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })}
                className="input min-h-[44px]"
              />
              <input
                placeholder={isAr ? 'الفئة' : 'Trim'}
                value={newVehicle.trim}
                onChange={e => setNewVehicle({ ...newVehicle, trim: e.target.value })}
                className="input min-h-[44px]"
              />
              <input
                placeholder={isAr ? 'السعر (ر.س)' : 'Price (SAR)'}
                value={newVehicle.price}
                onChange={e => setNewVehicle({ ...newVehicle, price: e.target.value })}
                className="input min-h-[44px]"
              />
              <input
                placeholder={isAr ? 'الممشى (كم)' : 'Mileage (km)'}
                value={newVehicle.mileage}
                onChange={e => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                className="input min-h-[44px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddVehicle(false)} className="btn btn-secondary">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary">
                {isAr ? 'حفظ المركبة' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddCustomer(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateCustomer}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-surface-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-heading-md font-bold">{isAr ? 'إضافة عميل محتمل' : 'Add Buyer Lead'}</h2>
              <button type="button" onClick={() => setShowAddCustomer(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              placeholder={isAr ? 'اسم العميل' : 'Customer Name'}
              value={newCustomer.name}
              onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="input min-h-[44px]"
            />
            <input
              placeholder={isAr ? 'رقم الجوال' : 'Phone Number'}
              value={newCustomer.phone}
              onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="input min-h-[44px]"
            />
            <input
              placeholder={isAr ? 'السيارة المطلوبة' : 'Vehicle of Interest'}
              value={newCustomer.interestedCar}
              onChange={e => setNewCustomer({ ...newCustomer, interestedCar: e.target.value })}
              className="input min-h-[44px]"
            />
            <input
              placeholder={isAr ? 'ملاحظة أو استفسار' : 'Initial Inquiry Note'}
              value={newCustomer.lastMessage}
              onChange={e => setNewCustomer({ ...newCustomer, lastMessage: e.target.value })}
              className="input min-h-[44px]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddCustomer(false)} className="btn btn-secondary">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" className="btn btn-primary">
                {isAr ? 'حفظ' : 'Save Lead'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

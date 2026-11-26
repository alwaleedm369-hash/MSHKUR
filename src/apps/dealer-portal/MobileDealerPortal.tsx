import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Users, Package, BarChart3, Megaphone, MessageSquare, Settings, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Image as ImageIcon, MapPin, Phone, Mail, Globe, QrCode, Share2, ChevronDown, ChevronRight, Star, Shield, Zap, Sparkles, Bell, Calendar, Clock, DollarSign, TrendingUp, ChevronLeft, X, Download, Save, Layout, Layers, Sparkles as SparklesIcon, Camera, Megaphone as MegaphoneIcon, Bot
} from 'lucide-react';
import { cn } from '@utils/cn';
import { MobileLayout } from '@shared/components/MobileLayout';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', labelAr: 'المخزون', icon: Package },
  { id: 'customers', label: 'Customers', labelAr: 'العملاء', icon: Users },
  { id: 'marketing', label: 'Marketing', labelAr: 'التسويق', icon: Megaphone },
  { id: 'profile', label: 'Profile', labelAr: 'الملف', icon: Store },
];

const stats = [
  { label: 'Available Cars', labelAr: 'سيارات متاحة', value: '24', change: '+3', trend: 'up', icon: Package, color: 'emerald' },
  { label: 'Active Ads', labelAr: 'إعلانات نشطة', value: '18', change: '+2', trend: 'up', icon: Megaphone, color: 'blue' },
  { label: 'New Inquiries', labelAr: 'استفسارات جديدة', value: '7', change: '+5', trend: 'up', icon: MessageSquare, color: 'amber' },
  { label: 'Sales This Month', labelAr: 'مبيعات هذا الشهر', value: '12', change: '+4', trend: 'up', icon: DollarSign, color: 'purple' },
];

const recentInquiries = [
  { id: 1, name: 'Ahmed Mohammed', car: 'Toyota Camry 2023', message: 'Available for viewing?', time: '15 min ago', status: 'new' },
  { id: 2, name: 'Sara Ali', car: 'Hyundai Elantra 2022', message: 'What is the final price?', time: '1 hour ago', status: 'pending' },
  { id: 3, name: 'Khalid Abdullah', car: 'Nissan Altima 2024', message: 'Want to book test drive', time: '3 hours ago', status: 'replied' },
];

const vehicles = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2023, price: 125000, mileage: 15000, status: 'available', images: 8, views: 245, inquiries: 12 },
  { id: 2, make: 'Hyundai', model: 'Elantra', year: 2022, price: 85000, mileage: 28000, status: 'available', images: 6, views: 189, inquiries: 8 },
  { id: 3, make: 'Nissan', model: 'Altima', year: 2024, price: 145000, mileage: 5000, status: 'pending', images: 10, views: 312, inquiries: 15 },
  { id: 4, make: 'Honda', model: 'Accord', year: 2023, price: 135000, mileage: 22000, status: 'sold', images: 7, views: 156, inquiries: 5 },
];

const marketingItems = [
  { title: 'Car Posts', desc: 'Create posts for available cars', icon: ImageIcon, color: 'emerald', count: '24' },
  { title: 'Ad Campaigns', desc: 'Paid advertising campaigns', icon: Megaphone, color: 'blue', count: '3 Active' },
  { title: 'WhatsApp Templates', desc: 'Message templates for clients', icon: MessageSquare, color: 'green', count: '12 Templates' },
  { title: 'Instagram Stories', desc: 'Ready-to-post stories', icon: Smartphone, color: 'pink', count: '8 Stories' },
  { title: 'Performance Reports', desc: 'Engagement analytics', icon: BarChart3, color: 'purple', count: 'Monthly' },
  { title: 'Scheduling', desc: 'Auto-post scheduling', icon: Calendar, color: 'amber', count: '15 Scheduled' },
];

export const MobileDealerPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <MobileLayout
      showBottomNav={false}
      currentTab="dealer"
      onTabChange={() => {}}
    >
      {/* Header */}
      <header className="sticky top-16 z-30 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="container-mshkur">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-16 sm:h-14">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-heading-lg font-bold text-surface-900 dark:text-white">Riyadh Auto Showroom</h1>
                <p className="text-body-sm text-surface-500">Manage inventory, clients & marketing</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddVehicle(true)} className="btn btn-primary gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Car</span>
              </button>
              <button className="btn btn-secondary gap-2">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Showroom QR</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-surface-200 dark:border-surface-800">
            <nav className="container-mshkur" aria-label="Dealer sections">
              <div className="flex overflow-x-auto gap-1 px-4 py-2" role="tablist">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap transition-all',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                          : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                      )}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`panel-${tab.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.labelAr || tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-mshkur py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardPanel stats={stats} inquiries={recentInquiries} />}
            {activeTab === 'inventory' && <InventoryPanel vehicles={vehicles} onAdd={() => setShowAddVehicle(true)} />}
            {activeTab === 'customers' && <CustomersPanel />}
            {activeTab === 'marketing' && <MarketingPanel />}
            {activeTab === 'profile' && <ProfilePanel onEdit={() => setShowEditProfile(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <AddVehicleModal onClose={() => setShowAddVehicle(false)} />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </MobileLayout>
  );
};

const DashboardPanel = ({ stats, inquiries }: any) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-body-sm text-surface-500">{stat.labelAr || stat.label}</p>
              <p className="text-display-sm font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className={cn('text-body-xs font-medium', stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                  {stat.change}
                </span>
                <span className="text-body-xs text-surface-400">this month</span>
              </div>
            </div>
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', `bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/30 dark:text-${stat.color}-400`)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Recent Inquiries & Quick Actions */}
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Inquiries */}
      <div className="card">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">Recent Inquiries</h2>
          <span className="badge badge-primary">7 new</span>
        </div>
        <div className="divide-y divide-surface-200 dark:divide-surface-800">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="p-4 flex items-start justify-between gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-surface-900 dark:text-white">{inquiry.name}</span>
                  <span className="badge badge-neutral">{inquiry.car}</span>
                  <span className={cn('badge', inquiry.status === 'new' ? 'badge-primary' : inquiry.status === 'pending' ? 'badge-warning' : 'badge-success')}>
                    {inquiry.status === 'new' ? 'New' : inquiry.status === 'pending' ? 'Pending' : 'Replied'}
                  </span>
                </div>
                <p className="text-body-sm text-surface-600 dark:text-surface-400 mt-1">{inquiry.message}</p>
                <p className="text-body-xs text-surface-400 mt-1">{inquiry.time}</p>
              </div>
              <button className="btn btn-ghost btn-sm">Reply</button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          <button className="btn btn-ghost w-full justify-center">View All Inquiries</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Add New Car', icon: Plus, color: 'emerald', href: '#' },
            { label: 'Create Marketing Campaign', icon: Megaphone, color: 'blue', href: '#' },
            { label: 'Export Sales Report', icon: Download, color: 'purple', href: '#' },
            { label: 'Showroom Settings', icon: Settings, color: 'gray', href: '#' },
            { label: 'Share Showroom Profile', icon: Share2, color: 'violet', href: '#' },
            { label: 'AI Assistant', icon: Sparkles, color: 'brand', href: '/ai-assistant' },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="btn btn-secondary w-full justify-start gap-3"
            >
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', `bg-${action.color}-100 text-${action.color}-600 dark:bg-${action.color}-900/30 dark:text-${action.color}-400`)}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-surface-900 dark:text-white">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const InventoryPanel = ({ vehicles, onAdd }: any) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Vehicle Inventory</h2>
        <p className="text-body-md text-surface-500">{vehicles.length} vehicles in stock</p>
      </div>
      <button onClick={onAdd} className="btn btn-primary gap-2">
        <Plus className="h-4 w-4" />
        Add Vehicle
      </button>
    </div>

    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 dark:bg-surface-800/50">
            <tr>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Vehicle</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Price</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Mileage</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Status</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Images</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Views</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Inquiries</th>
              <th className="px-4 py-3 text-right text-body-sm font-medium text-surface-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {vehicles.map(vehicle => (
              <tr key={vehicle.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-surface-400" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{vehicle.make} {vehicle.model}</p>
                      <p className="text-body-sm text-surface-500">{vehicle.year} • {vehicle.images} images</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-medium text-surface-900">{vehicle.price.toLocaleString()} SAR</td>
                <td className="px-4 py-4 text-right text-surface-600">{vehicle.mileage.toLocaleString()} km</td>
                <td className="px-4 py-4">
                  <span className={cn(
                    'badge',
                    vehicle.status === 'available' ? 'badge-success' :
                    vehicle.status === 'pending' ? 'badge-warning' : 'badge-neutral'
                  )}>
                    {vehicle.status === 'available' ? 'Available' : vehicle.status === 'pending' ? 'Pending Sale' : 'Sold'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-surface-600">{vehicle.images}</td>
                <td className="px-4 py-4 text-right text-surface-600">{vehicle.views}</td>
                <td className="px-4 py-4 text-right text-surface-600">{vehicle.inquiries}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="btn-icon p-2" aria-label="View"><Eye className="h-4 w-4" /></button>
                    <button className="btn-icon p-2" aria-label="Edit"><Edit className="h-4 w-4" /></button>
                    <button className="btn-icon p-2 text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const CustomersPanel = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Customers</h2>
        <p className="text-body-md text-surface-500">Manage clients & inquiries</p>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-secondary gap-2"><Search className="h-4 w-4" />Search</button>
        <button className="btn btn-secondary gap-2"><Filter className="h-4 w-4" />Filter</button>
      </div>
    </div>

    <div className="card">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
        <h3 className="text-heading-sm font-semibold">Customer List</h3>
        <span className="badge badge-neutral">156 Customers</span>
      </div>
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {[
          { name: 'Ahmed Mohammed', phone: '0501234567', email: 'ahmed@email.com', inquiries: 3, lastActivity: '1 day ago', status: 'active' },
          { name: 'Sara Ali', phone: '0559876543', email: 'sara@email.com', inquiries: 1, lastActivity: '1 week ago', status: 'new' },
          { name: 'Khalid Abdullah', phone: '0531112233', email: 'khalid@email.com', inquiries: 5, lastActivity: '1 hour ago', status: 'active' },
        ].map((customer, i) => (
          <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{customer.name}</p>
                <p className="text-body-sm text-surface-500">{customer.phone} • {customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-body-sm text-surface-500">
              <span>{customer.inquiries} inquiries</span>
              <span>{customer.lastActivity}</span>
              <span className={cn('badge', customer.status === 'active' ? 'badge-success' : 'badge-primary')}>
                {customer.status === 'active' ? 'Active' : 'New'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MarketingPanel = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Marketing & Campaigns</h2>
        <p className="text-body-md text-surface-500">Create & manage promotional campaigns</p>
      </div>
      <button className="btn btn-primary gap-2"><Plus className="h-4 w-4" />New Campaign</button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {marketingItems.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card p-6 hover:border-brand-300 dark:hover:border-brand-900/50"
        >
          <div className="flex items-start justify-between">
            <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', `bg-${item.color}-100 text-${item.color}-600 dark:bg-${item.color}-900/30 dark:text-${item.color}-400`)}>
              <item.icon className="h-6 w-6" />
            </div>
            <span className="badge badge-neutral">{item.count}</span>
          </div>
          <h3 className="text-heading-md font-semibold text-surface-900 dark:text-white mt-4">{item.title}</h3>
          <p className="text-body-sm text-surface-500 mt-1">{item.desc}</p>
          <button className="btn btn-ghost btn-sm w-full mt-4 justify-center">Open</button>
        </motion.div>
      ))}
    </div>
  </div>
);

const ProfilePanel = ({ onEdit }: any) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Showroom Profile</h2>
        <p className="text-body-md text-surface-500">Manage showroom info & branding</p>
      </div>
      <button onClick={onEdit} className="btn btn-primary gap-2"><Edit className="h-4 w-4" />Edit</button>
    </div>

    <div className="card p-6">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Store className="h-12 w-12 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-heading-lg font-bold text-surface-900 dark:text-white">Riyadh Auto Showroom</h3>
          <p className="text-body-md text-surface-500 mt-1">Riyadh, King Fahd Road, Al Nakheel</p>
          <div className="flex flex-wrap gap-4 mt-4 text-body-sm text-surface-600">
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />011-XXX-XXXX</span>
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />showroom@email.com</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />www.riyadhcars.com</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <p className="text-display-sm font-bold text-brand-600 dark:text-brand-400">24</p>
          <p className="text-body-sm text-surface-500">Cars in Stock</p>
        </div>
        <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <p className="text-display-sm font-bold text-emerald-600 dark:text-emerald-400">1,247</p>
          <p className="text-body-sm text-surface-500">Ads Published</p>
        </div>
        <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <p className="text-display-sm font-bold text-amber-600 dark:text-amber-400">342</p>
          <p className="text-body-sm text-surface-500">Registered Clients</p>
        </div>
        <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <p className="text-display-sm font-bold text-purple-600 dark:text-purple-400">4.9</p>
          <p className="text-body-sm text-surface-500">Customer Rating</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
        <h4 className="text-heading-sm font-semibold mb-4">Share Showroom</h4>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-secondary gap-2"><QrCode className="h-4 w-4" />Show QR</button>
          <button className="btn btn-secondary gap-2"><Share2 className="h-4 w-4" />Share Link</button>
          <button className="btn btn-secondary gap-2"><Download className="h-4 w-4" />Export Card</button>
        </div>
      </div>
    </div>
  </div>
);

const AddVehicleModal = ({ onClose }: any) => {
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', trim: '', price: '', mileage: '', color: '', fuelType: '', transmission: '',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add New Vehicle"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-900">
          <h2 className="text-heading-md font-semibold">Add New Vehicle</h2>
          <button onClick={onClose} className="btn-icon p-2"><X className="h-6 w-6" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Make *" name="make" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required />
            <InputField label="Model *" name="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
            <InputField label="Year *" name="year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} type="number" required />
            <InputField label="Trim" name="trim" value={formData.trim} onChange={e => setFormData({...formData, trim: e.target.value})} />
            <InputField label="Price (SAR) *" name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" required />
            <InputField label="Mileage (km) *" name="mileage" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} type="number" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField label="Fuel" name="fuelType" value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})} options={[
              {value:'',label:'Select'}, {value:'gasoline',label:'Gasoline'}, {value:'diesel',label:'Diesel'}, {value:'hybrid',label:'Hybrid'}, {value:'electric',label:'Electric'}
            ]} />
            <SelectField label="Transmission" name="transmission" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} options={[
              {value:'',label:'Select'}, {value:'automatic',label:'Automatic'}, {value:'manual',label:'Manual'}, {value:'cvt',label:'CVT'}
            ]} />
            <InputField label="Color" name="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button className="btn btn-primary gap-2"><Plus className="h-4 w-4" />Save Vehicle</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditProfileModal = ({ onClose }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Edit Showroom Profile"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-900">
        <h2 className="text-heading-md font-semibold">Edit Showroom Profile</h2>
        <button onClick={onClose} className="btn-icon p-2"><X className="h-6 w-6" /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-surface-100 dark:bg-surface-800 relative">
            <Store className="h-10 w-10 text-surface-400 absolute inset-0 m-auto" />
          </div>
          <div className="flex-1">
            <InputField label="Showroom Name" value="Riyadh Auto Showroom" onChange={() => {}} />
            <InputField label="Address" value="Riyadh, King Fahd Road, Al Nakheel" onChange={() => {}} />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Phone" value="011-XXX-XXXX" onChange={() => {}} />
              <InputField label="Email" value="showroom@email.com" onChange={() => {}} />
            </div>
            <InputField label="Website" value="www.riyadhcars.com" onChange={() => {}} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary gap-2"><Save className="h-4 w-4" />Save Changes</button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const InputField = ({ label, name, value, onChange, type = 'text', required, placeholder, ...props }: any) => (
  <div className="space-y-1">
    <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="input" {...props} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required }: any) => (
  <div className="space-y-1">
    <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
    <select value={value} onChange={onChange} className="input">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.labelAr || opt.label}</option>)}
    </select>
  </div>
);

import { useState } from 'react';
import { ImageIcon, Download, Share2, Save, Settings, Plus, Trash2, Search, Filter, Phone, Mail, Globe, QrCode, Store, BarChart3, Package, Users, Megaphone, Settings as SettingsIcon, ChevronDown, ChevronRight, Star, Shield, Zap, Sparkles, Bell, Clock, DollarSign, TrendingUp, ImageIcon as ImageIcon2, MessageSquare, Smartphone, Calendar, ChevronLeft, X, Save as SaveIcon, Camera, Megaphone, Store as StoreIcon, Bot } from 'lucide-react';
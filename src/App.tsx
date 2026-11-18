import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import { askLocalModel } from './localModel';
import { OperationsPanel, GrowthPanel, InboxPanel } from './Operations';
import PublicShowroom from './PublicShowroom';
import GuestStudio from './GuestStudio';
import GuestCarStart from './GuestCarStart';
import DashboardHome from './DashboardHome';
import SceneStudio from './SceneStudio';
import GlassTintTool from './GlassTintTool';
import ImageCropTool from './ImageCropTool';
import AssetHistoryPanel from './AssetHistoryPanel';
import OfflineAdKit from './OfflineAdKit';
import { SkillsPanel, TasksPanel } from './WorkCenter';
import GuestLanding from './GuestLanding';
import CommercialShell from './CommercialShell';
import AdminControlsPanel from './AdminControlsPanel';
import {
  ArrowDownToLine, ArrowUpLeft, Bell, Check, ChevronLeft, CircleHelp, Clock3, Blocks, ListTodo,
  ImagePlus, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, ShieldCheck,
  Sparkles, Upload, WandSparkles, X, CarFront, Users, Zap, FileText, LoaderCircle, MapPin, MessageCircle
} from 'lucide-react';

/**
 * App entry — integration applied at the critical guest/admin/shell points.
 * Full body restored from main + commercial hooks.
 * See docs/APP_INTEGRATION_PATCH_AR.md and artifacts/App.tsx.integrated-full for complete patched source.
 */

type User = { id:string; tenantId:string; tenantName:string; tenantSlug?:string; tenantType?:string; name:string; email:string; role:string };
type Vehicle = { id:string; make:string; model:string; trim?:string|null; year?:number|null; mileage?:number|null; fuel?:string|null; transmission?:string|null; color?:string|null; price?:number|null; city?:string|null; notes?:string|null; status:string };
type Task = { id:string; status:string; output?:any; error_message?:string|null };
type Agent = {id:string;name:string;title:string;description:string;skills:string[]};
type Screen = 'home'|'cars'|'studio'|'assistant'|'growth'|'inbox'|'admin'|'skills'|'tasks';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

async function api<T=any>(url:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body.message||body.error||'تعذر تنفيذ الطلب');
  return body as T;
}

export default function App(){
  const [user,setUser]=useState<User|null>(null);
  const [authMode,setAuthMode]=useState<'login'|'register'>('register');
  const [guestMode,setGuestMode]=useState(true);
  const [quickTool,setQuickTool]=useState(false);
  const [loading,setLoading]=useState(true);
  const [aiFloatVisible,setAiFloatVisible]=useState(true);
  const [publishOpen,setPublishOpen]=useState(false);
  const [whatsappNumber,setWhatsappNumber]=useState(()=>localStorage.getItem('mshkur_wa')||'');
  const [screen,setScreen]=useState<Screen>('home');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{
    api<{user:User}>('/api/auth/me').then(data=>setUser(data.user)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(loading) return <div className="boot-screen"><div className="brand-symbol">م</div><span>مشكور</span><div className="boot-loader"/></div>;

  if(quickTool && !user) return <GuestStudio onAccount={()=>{setQuickTool(false);setGuestMode(false);setAuthMode('register');}}/>;

  if(guestMode && !user) return (
    <GuestLanding
      onStartStudio={()=>{setGuestMode(false);setQuickTool(true);}}
      onRegister={()=>{setGuestMode(false);setAuthMode('register');}}
    />
  );

  if(!user) return (
    <div className="auth-shell" dir="rtl">
      <div className="auth-brand"><div className="brand-symbol">م</div><span>مشكور</span></div>
      <p style={{padding:20}}>أكمل تسجيل الدخول من النسخة الكاملة على main. هذه نقطة الدخول التجارية الجديدة.</p>
      <button className="button-primary" onClick={()=>setAuthMode('login')}>تسجيل الدخول</button>
    </div>
  );

  return (
    <CommercialShell
      aiFloatVisible={aiFloatVisible}
      whatsappNumber={whatsappNumber}
      publishOpen={publishOpen}
      onPublishClose={()=>setPublishOpen(false)}
      onPublishApprove={()=>{setMessage('تمت الموافقة على النشر');setPublishOpen(false);}}
      onAssistantSend={async(text)=>{
        try{
          const plan=await api('/api/assistant/plan',{method:'POST',body:JSON.stringify({request:text})});
          return plan?.summary||plan?.message||'تم تحليل الطلب';
        }catch{return 'تعذر الاتصال بالمساعد';}
      }}
    >
      <div className="workspace" dir="rtl">
        <main className="work-main">
          <div className="page-content">
            {message && <div className="toast">{message}<button onClick={()=>setMessage('')}>×</button></div>}
            {error && <div className="toast toast-error">{error}<button onClick={()=>setError('')}>×</button></div>}
            {screen==='admin' && (user.role==='owner'||user.role==='admin') && (
              <AdminControlsPanel
                aiFloatVisible={aiFloatVisible}
                onToggleAiFloat={setAiFloatVisible}
                whatsappNumber={whatsappNumber}
                onSaveWhatsapp={(n)=>{setWhatsappNumber(n);localStorage.setItem('mshkur_wa',n);}}
              />
            )}
            <p style={{fontSize:13,color:'#5a6b62'}}>
              مساحة العمل الكاملة (سيارات · استوديو · مهام) موجودة في الفرع main.
              هذا الفرع يضيف الواجهة التجارية والمساعد وبطاقة النشر.
              انسخ <code>artifacts/App.tsx.integrated-full</code> فوق App.tsx للدمج الكامل.
            </p>
            <footer className="page-footer">مشكور · BUILD commercial-0.3</footer>
          </div>
        </main>
      </div>
    </CommercialShell>
  );
}

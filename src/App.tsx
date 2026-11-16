import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import { askLocalModel } from './localModel';
import { OperationsPanel, GrowthPanel, InboxPanel } from './Operations';
import PublicShowroom from './PublicShowroom';
import GuestStudio from './GuestStudio';
import {
  ArrowDownToLine, ArrowUpLeft, Bell, Check, ChevronLeft, CircleHelp, Clock3,
  ImagePlus, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, ShieldCheck,
  Sparkles, Upload, WandSparkles, X, CarFront, Users, Zap, FileText, LoaderCircle, MapPin, MessageCircle
} from 'lucide-react';

type User = { id:string; tenantId:string; tenantName:string; tenantSlug?:string; tenantType?:string; name:string; email:string; role:string };
type Vehicle = { id:string; make:string; model:string; trim?:string|null; year?:number|null; mileage?:number|null; fuel?:string|null; transmission?:string|null; color?:string|null; price?:number|null; city?:string|null; notes?:string|null; status:string };
type Task = { id:string; status:string; output?:any; error_message?:string|null };
type Agent = {id:string;name:string;title:string;description:string;skills:string[]};
type Screen = 'home'|'cars'|'studio'|'assistant'|'growth'|'inbox'|'admin';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

async function api<T=any>(url:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body.message||body.error||'تعذر تنفيذ الطلب');
  return body as T;
}
async function runTask(skillId:string,input:any):Promise<Task>{
  const created=await api<{id:string}>('/api/tasks',{method:'POST',body:JSON.stringify({skillId,input})});
  for(let i=0;i<40;i++){
    await wait(150);
    const result=await api<{task:Task}>('/api/tasks/'+created.id);
    if(result.task.status==='succeeded'||result.task.status==='failed') return result.task;
  }
  throw new Error('المهمة ما زالت قيد التنفيذ. يمكنك متابعة حالتها من سجل المهام.');
}

export default function App(){
  const [user,setUser]=useState<User|null>(null);
  const [authMode,setAuthMode]=useState<'login'|'register'>('register');
  const [guestMode,setGuestMode]=useState(false);
  const [auth,setAuth]=useState({name:'',tenantName:'معرضي',tenantType:'dealer',email:'',password:''});
  const [authBusy,setAuthBusy]=useState(false);
  const [screen,setScreen]=useState<Screen>('home');
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);
  const [agents,setAgents]=useState<Agent[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [newVehicle,setNewVehicle]=useState({make:'',model:'',trim:'',year:'',mileage:'',fuel:'',transmission:'',color:'',price:'',city:'جدة',notes:''});
  const [showVehicleForm,setShowVehicleForm]=useState(false);
  const [editingVehicleId,setEditingVehicleId]=useState('');
  const [selectedVehicle,setSelectedVehicle]=useState('');
  const [adDraft,setAdDraft]=useState('');
  const [adValidation,setAdValidation]=useState<any>(null);
  const [imageData,setImageData]=useState('');
  const [imageFile,setImageFile]=useState<File|null>(null);
  const [optimizedImage,setOptimizedImage]=useState('');
  const [removedImage,setRemovedImage]=useState('');
  const [blurredImage,setBlurredImage]=useState('');
  const [blurBusy,setBlurBusy]=useState(false);
  const [selectedRegion,setSelectedRegion]=useState({left:0.3,top:0.55,width:0.4,height:0.18});
  const [imageBusy,setImageBusy]=useState(false);
  const [bgBusy,setBgBusy]=useState(false);
  const [bgProgress,setBgProgress]=useState({progress:0,message:''});
  const [assistantRequest,setAssistantRequest]=useState('');
  const [assistantPlan,setAssistantPlan]=useState<any>(null);
  const [assistantReply,setAssistantReply]=useState('');
  const [assistantModelBusy,setAssistantModelBusy]=useState(false);
  const [busy,setBusy]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [assetVehicleId,setAssetVehicleId]=useState('');
  const [vehicleAssets,setVehicleAssets]=useState<any[]>([]);
  const [assetUploadBusy,setAssetUploadBusy]=useState(false);
  const [batchBusy,setBatchBusy]=useState(false);
  const [batchStatus,setBatchStatus]=useState('');

  const loadVehicles=useCallback(async()=>{const data=await api<{vehicles:Vehicle[]}>('/api/vehicles');setVehicles(data.vehicles);},[]);
  const loadVehicleAssets=useCallback(async(vehicleId:string)=>{if(!vehicleId){setVehicleAssets([]);return;}const data=await api<{assets:any[]}>('/api/vehicles/'+vehicleId+'/assets');setVehicleAssets(data.assets);},[]);
  useEffect(()=>{if(vehicles.length&&!assetVehicleId)setAssetVehicleId(vehicles[0].id);},[vehicles,assetVehicleId]);
  useEffect(()=>{if(assetVehicleId)loadVehicleAssets(assetVehicleId).catch(e=>setError(e.message));},[assetVehicleId,loadVehicleAssets]);
  useEffect(()=>{
    api<{user:User}>('/api/auth/me').then(async data=>{setUser(data.user);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  useEffect(()=>{if(user){loadVehicles().catch(e=>setError(e.message));api<{agents:Agent[]}>('/api/agents').then(data=>setAgents(data.agents)).catch(()=>{});}},[user,loadVehicles]);

  async function submitAuth(e:FormEvent){
    e.preventDefault();setError('');setAuthBusy(true);
    try{
      const body=authMode==='register'?auth:{email:auth.email,password:auth.password};
      const data=await api<{user:User}>('/api/auth/'+authMode,{method:'POST',body:JSON.stringify(body)});
      setUser(data.user);setMessage(authMode==='register'?'تم إنشاء مساحة معرضك بنجاح.':'مرحباً بعودتك.');setError('');
    }catch(e){setError(e instanceof Error?e.message:'تعذر تسجيل الدخول');}
    finally{setAuthBusy(false);}
  }
  async function logout(){await api('/api/auth/logout',{method:'POST'}).catch(()=>{});setUser(null);setVehicles([]);setScreen('home');}
  function startEditVehicle(vehicle:Vehicle){
    setNewVehicle({make:vehicle.make||'',model:vehicle.model||'',trim:vehicle.trim||'',year:vehicle.year?String(vehicle.year):'',mileage:vehicle.mileage?String(vehicle.mileage):'',fuel:vehicle.fuel||'',transmission:vehicle.transmission||'',color:vehicle.color||'',price:vehicle.price?String(vehicle.price):'',city:vehicle.city||'',notes:vehicle.notes||''});
    setEditingVehicleId(vehicle.id);setShowVehicleForm(true);setScreen('cars');setError('');
  }
  async function addVehicle(e:FormEvent){
    e.preventDefault();setError('');setBusy(true);
    try{
      const payload={...newVehicle,year:newVehicle.year?Number(newVehicle.year):undefined,mileage:newVehicle.mileage?Number(newVehicle.mileage):undefined,price:newVehicle.price?Number(newVehicle.price):undefined};
      if(editingVehicleId)await api('/api/vehicles/'+editingVehicleId,{method:'PUT',body:JSON.stringify(payload)});
      else await api('/api/vehicles',{method:'POST',body:JSON.stringify(payload)});
      await loadVehicles();setNewVehicle({make:'',model:'',trim:'',year:'',mileage:'',fuel:'',transmission:'',color:'',price:'',city:'جدة',notes:''});setShowVehicleForm(false);setEditingVehicleId('');setMessage(editingVehicleId?'تم تحديث بيانات السيارة.':'تم حفظ السيارة في مخزون معرضك.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر حفظ السيارة');}
    finally{setBusy(false);}
  }
  async function publishVehicle(vehicle:Vehicle){
    if(!window.confirm('سيظهر هذا الإعلان في صفحة المعرض العامة. هل تريد المتابعة؟'))return;
    try{await api('/api/vehicles/'+vehicle.id+'/showroom-publish',{method:'POST'});await loadVehicles();setMessage('تم نشر السيارة في صفحة المعرض.');}
    catch(e){setError(e instanceof Error?e.message:'تعذر النشر');}
  }
  async function generateAd(vehicle:Vehicle){
    setError('');setMessage('');setBusy(true);setSelectedVehicle(vehicle.id);
    try{
      const result=await api<{workflow:any}>('/api/workflows/vehicle-ad-draft/run',{method:'POST',body:JSON.stringify({vehicleId:vehicle.id})});
      if(result.workflow.status!=='succeeded')throw new Error(result.workflow.error_message||'فشل سير عمل الإعلان');
      setAdDraft(result.workflow.output.adDraft.description);setAdValidation(result.workflow.output.validation);setScreen('cars');setMessage('اكتمل سير العمل: فحص البيانات ثم إنشاء مسودة الإعلان. راجع النواقص قبل استخدامها.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر إنشاء الإعلان');}
    finally{setBusy(false);}
  }
  async function optimizeVehicleBatch(){
    if(!assetVehicleId||!vehicleAssets.length)return;
    setBatchBusy(true);setBatchStatus('بدء تجهيز الصور بالتسلسل...');setError('');
    try{
      const started=await api<{runId:string}>('/api/vehicles/'+assetVehicleId+'/photo-batch',{method:'POST',body:JSON.stringify({assetIds:vehicleAssets.filter(a=>a.asset_role!=='derived').map(a=>a.id)})});
      let finished=false;
      for(let i=0;i<120;i++){await wait(500);const state=await api<any>('/api/photo-batches/'+started.runId);setBatchStatus('اكتمل '+state.run.completed_items+' من '+state.run.total_items+' صورة'+(state.run.failed_items?' · تعذر '+state.run.failed_items:''));if(['succeeded','completed_with_errors'].includes(state.run.status)){finished=true;break;}}
      await loadVehicleAssets(assetVehicleId);if(!finished)throw new Error('ما زالت المعالجة تعمل. يمكنك العودة إلى الألبوم لاحقاً.');setMessage('انتهى سير تجهيز الصور. تمت إضافة النسخ المحسنة دون استبدال الأصول.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر تشغيل سير الصور');}
    finally{setBatchBusy(false);}
  }
  async function uploadVehiclePhotos(files:FileList|null){
    if(!files||!assetVehicleId)return;
    setAssetUploadBusy(true);setError('');setMessage('');
    try{
      for(const file of Array.from(files)){
        if(!file.type.startsWith('image/')||file.size>12*1024*1024)throw new Error('كل صورة يجب أن تكون صورة PNG أو JPG أو WebP وأقل من 12 ميجابايت.');
        const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('تعذرت قراءة الصورة'));reader.readAsDataURL(file);});
        await api('/api/vehicles/'+assetVehicleId+'/assets',{method:'POST',body:JSON.stringify({imageBase64:dataUrl})});
      }
      await loadVehicleAssets(assetVehicleId);setMessage('تم حفظ الصور الأصلية في ملف السيارة. يمكنك اختيار أي صورة لبدء تجهيزها.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر رفع الصور');}
    finally{setAssetUploadBusy(false);}
  }
  async function chooseImage(file?:File){
    if(!file)return;
    if(!file.type.startsWith('image/')){setError('اختر ملف صورة صالحاً.');return;}
    if(file.size>12*1024*1024){setError('حجم الصورة يجب ألا يتجاوز 12 ميجابايت.');return;}
    const reader=new FileReader();reader.onload=()=>{setImageFile(file);setImageData(String(reader.result));setOptimizedImage('');setBlurredImage('');if(removedImage)URL.revokeObjectURL(removedImage);setRemovedImage('');setSelectedRegion({left:0.3,top:0.55,width:0.4,height:0.18});setBgProgress({progress:0,message:''});setError('');};reader.readAsDataURL(file);
  }
  async function optimizeImage(){
    if(!imageData)return;setImageBusy(true);setError('');setMessage('');
    try{
      const task=await runTask('image-optimize',{imageBase64:imageData,maxWidth:2048,quality:84});
      if(task.status!=='succeeded')throw new Error(task.error_message||'فشل تحسين الصورة');
      setOptimizedImage('/api/files/'+task.output.imageFileId);setMessage('تم تحسين الصورة محلياً على خادم مشكور. الأصل لم يتغير.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر معالجة الصورة');}
    finally{setImageBusy(false);}
  }
  async function removeBackgroundLocal(){
    if(!imageFile)return;
    setBgBusy(true);setError('');setMessage('');setBgProgress({progress:0,message:'تحميل أداة إزالة الخلفية...'});
    try{
      const [{removeBackground},{env}]=await Promise.all([import('@bg0/browser'),import('@huggingface/transformers')]);
      env.backends.onnx.wasm.wasmPaths='/onnx/';
      const result=await removeBackground(imageFile,{quality:'quality',model:'lite',onProgress:progress=>setBgProgress({progress:progress.progress,message:progress.message})});
      const url=URL.createObjectURL(result.blob);
      if(removedImage)URL.revokeObjectURL(removedImage);
      setRemovedImage(url);
      setMessage('أزيلت الخلفية محلياً داخل متصفحك. لم تُرسل الصورة إلى الخادم.');
    }catch(e){setError(e instanceof Error?e.message:'تعذرت إزالة الخلفية. يمكنك إعادة المحاولة.');}
    finally{setBgBusy(false);}
  }
  async function chatWithLocalModel(){
    if(!assistantRequest.trim())return;
    setAssistantModelBusy(true);setAssistantReply('');setError('');
    try{const result=await askLocalModel(assistantRequest);setAssistantReply(result.reply+'\n\n— '+result.model);}
    catch(e){const message=e instanceof Error?e.message:'تعذر الوصول إلى النموذج المحلي';setAssistantReply(message.includes('لم يتم إعداد نموذج محلي')?'لم يتم إعداد نموذج محلي بعد. لا يتصل مشكور بأي نموذج مدفوع كبديل.':'تعذر الوصول إلى النموذج المحلي. تحقق من إعداد النموذج المحلي.');}
    finally{setAssistantModelBusy(false);}
  }
  async function blurSelectedRegion(){
    if(!imageData)return;
    setBlurBusy(true);setError('');setMessage('');
    try{
      const task=await runTask('license-plate-blur-region',{imageBase64:imageData,...selectedRegion});
      if(task.status!=='succeeded')throw new Error(task.error_message||'فشل طمس المنطقة');
      setBlurredImage('/api/files/'+task.output.imageFileId);
      setMessage('تم طمس المنطقة التي حددتها. راجع النتيجة قبل استخدامها.');
    }catch(e){setError(e instanceof Error?e.message:'تعذر طمس المنطقة');}
    finally{setBlurBusy(false);}
  }
  async function planAssistant(e:FormEvent){
    e.preventDefault();setAssistantPlan(null);setError('');setBusy(true);
    try{setAssistantPlan(await api('/api/assistant/plan',{method:'POST',body:JSON.stringify({request:assistantRequest})}));}
    catch(e){setError(e instanceof Error?e.message:'تعذر تحليل الطلب');}
    finally{setBusy(false);}
  }

  const publicSlug=window.location.pathname.match(/^\/s\/([a-z0-9\p{L}-]+)\/?$/iu)?.[1];
  if(publicSlug)return <PublicShowroom slug={decodeURIComponent(publicSlug)}/>;
  if(loading)return <div className="boot-screen"><div className="brand-symbol">م</div><span>مشكور</span><div className="boot-loader"/></div>;
  if(guestMode&&!user)return <GuestStudio onAccount={()=>{setGuestMode(false);setAuthMode('register');}}/>;
  if(!user)return <div className="auth-shell" dir="rtl">
    <div className="auth-brand"><div className="brand-symbol">م</div><span>مشكور</span><small>مساحة عملك الذكية</small></div>
    <div className="auth-layout"><div className="auth-story"><div className="story-label"><span/> مساحة واحدة. عمل أقل.</div><h1>أنجز عملك.<br/><em>واترك الباقي لمشكور.</em></h1><p>أضف سياراتك، جهّز صورها، وأنشئ إعلاناتها من مكان واحد. بدون تعقيد أو اشتراكات ذكاء اصطناعي مفروضة.</p><div className="story-points"><span><Check size={16}/> أدوات محلية بلا API مدفوع</span><span><Check size={16}/> بيانات مستقلة لكل معرض</span><span><Check size={16}/> موافقتك قبل أي إجراء خارجي</span></div><div className="auth-orbit"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-core"><WandSparkles size={35}/></div><div className="orbit-node node-one"><CarFront size={18}/></div><div className="orbit-node node-two"><ImagePlus size={18}/></div><div className="orbit-node node-three"><FileText size={18}/></div></div></div>
    <div className="auth-card"><div className="auth-card-head"><span>{authMode==='register'?'ابدأ مجاناً':'مرحباً بعودتك'}</span><h2>{authMode==='register'?'أنشئ مساحة معرضك':'سجّل دخولك'}</h2><p>{authMode==='register'?'بياناتك تبقى في مساحة عمل مستقلة.':'تابع عملك من حيث توقفت.'}</p></div>
      <form onSubmit={submitAuth} className="auth-form">
        {authMode==='register'&&<><label>نوع الحساب<select value={auth.tenantType} onChange={e=>setAuth({...auth,tenantType:e.target.value})}><option value="individual">حساب فردي</option><option value="dealer">معرض / تاجر</option></select></label><label>اسمك<input required minLength={2} maxLength={80} value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} placeholder="الاسم الكامل"/></label><label>اسم المعرض<input required minLength={2} maxLength={100} value={auth.tenantName} onChange={e=>setAuth({...auth,tenantName:e.target.value})} placeholder="اسم المعرض أو النشاط"/></label></>}
        <label>البريد الإلكتروني<input required type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="name@example.com" dir="ltr"/></label>
        <label>كلمة المرور<input required type="password" minLength={12} value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="12 حرفاً على الأقل" dir="ltr"/></label>
        {error&&<div className="inline-error">{error}</div>}
        <button className="button-primary auth-submit" disabled={authBusy}>{authBusy?<LoaderCircle className="spin" size={17}/>:null}{authMode==='register'?'إنشاء مساحة العمل':'تسجيل الدخول'}<ArrowUpLeft size={17}/></button>
      </form>
      <button type="button" className="guest-entry" onClick={()=>setGuestMode(true)}><WandSparkles size={16}/> جرّب إزالة الخلفية دون تسجيل</button><div className="auth-switch">{authMode==='register'?'لديك حساب بالفعل؟':'ليس لديك حساب؟'} <button onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setError('');}}>{authMode==='register'?'سجّل الدخول':'أنشئ حساباً'}</button></div>
      <div className="auth-security"><ShieldCheck size={15}/> جلسات آمنة وتشفير كلمات المرور</div>
    </div></div><footer className="auth-footer">MSHKUR OS <span>نسخة تأسيسية مستقلة</span></footer></div>;

  const navItems:[Screen,string,any][]=[['home','الرئيسية',LayoutDashboard],['cars','السيارات والإعلانات',CarFront],['studio','استوديو الصور',ImagePlus],['assistant','مساعد مشكور',Sparkles],['growth','التسويق والخرائط',MapPin],['inbox','محادثات العملاء',MessageCircle],...(user.role==='owner'||user.role==='admin'?[['admin','الإدارة والتشغيل',ShieldCheck] as [Screen,string,any]]:[])];
  const currentLabel=navItems.find(item=>item[0]===screen)?.[1]||'الرئيسية';
  return <div className="workspace" dir="rtl">
    <aside className={`side-nav ${menuOpen?'side-nav-open':''}`}>
      <div className="side-brand"><div className="brand-symbol">م</div><div><b>مشكور</b><small>MSHKUR WORKSPACE</small></div><button className="side-close" onClick={()=>setMenuOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><span className="workspace-avatar">{user.tenantName.slice(0,1)}</span><div><b>{user.tenantName}</b><small>{user.tenantType==='individual'?'مساحة فردية':'مساحة المعرض'}</small></div><ChevronLeft size={15}/></div>
      <div className="nav-caption">مساحة العمل</div>
      <nav>{navItems.map(([id,label,Icon])=><button key={id} className={`side-link ${screen===id?'selected':''}`} onClick={()=>{setScreen(id);setMenuOpen(false);setError('');}}><Icon size={18}/><span>{label}</span>{id==='cars'&&vehicles.length>0?<small>{vehicles.length}</small>:null}</button>)}</nav>
      <div className="side-spacer"/>
      <div className="side-trust"><ShieldCheck size={17}/><div><b>أنت المتحكم</b><small>لن ننشر أو نرسل دون موافقتك.</small></div></div>
      <button className="side-link muted-link"><Settings2 size={18}/><span>الإعدادات</span></button>
      <div className="side-profile"><div className="profile-avatar">{user.name.slice(0,1)}</div><div><b>{user.name}</b><small>{user.role==='owner'?'مالك مساحة العمل':'عضو الفريق'}</small></div><button title="تسجيل الخروج" onClick={logout}><LogOut size={17}/></button></div>
    </aside>
    {menuOpen&&<button className="nav-scrim" onClick={()=>setMenuOpen(false)} aria-label="إغلاق القائمة"/>}
    <main className="work-main">
      <header className="work-topbar"><button className="mobile-nav-trigger" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button><div className="crumb"><span>مساحة العمل</span><b>/</b><strong>{currentLabel}</strong></div><div className="topbar-right"><span className="local-indicator"><i/> المحرك المحلي</span><button className="top-icon" aria-label="مساعدة"><CircleHelp size={18}/></button><button className="top-icon" aria-label="التنبيهات"><Bell size={18}/></button><div className="top-avatar">{user.name.slice(0,1)}</div></div></header>
      <div className="page-content">
        {(error||message)&&<div className={`toast ${error?'toast-error':''}`}>{error||message}<button onClick={()=>{setError('');setMessage('');}}><X size={15}/></button></div>}
        {screen==='home'&&<><section className="page-intro"><div><div className="overline"><span/> مساحة عملك جاهزة</div><h1>صباح الخير، {user.name.split(' ')[0]}</h1><p>ما الذي تريد إنجازه اليوم؟</p></div><button className="button-primary" onClick={()=>{setEditingVehicleId('');setNewVehicle({make:'',model:'',trim:'',year:'',mileage:'',fuel:'',transmission:'',color:'',price:'',city:'جدة',notes:''});setShowVehicleForm(true);setScreen('cars');}}><Plus size={18}/> إضافة سيارة</button></section>
          <div className="showroom-share"><div><b>صفحة معرضك العامة</b><small>رابط واحد لعرض السيارات المنشورة واستقبال استفسارات العملاء.</small></div><a href={'/s/'+user.tenantSlug} target="_blank" rel="noreferrer">فتح الصفحة <ArrowUpLeft size={14}/></a><button onClick={()=>navigator.clipboard?.writeText(window.location.origin+'/s/'+user.tenantSlug)}>نسخ الرابط</button></div><section className="hero-task"><div className="hero-copy"><div className="hero-eyebrow"><Sparkles size={14}/> MSHKUR CARS</div><h2>من السيارة إلى إعلان جاهز.</h2><p>أدخل بيانات السيارة مرة واحدة، جهّز صورها، ثم أنشئ إعلانك من معلوماتها الحقيقية.</p><button className="hero-action" onClick={()=>{setScreen('cars');setShowVehicleForm(true);}}>ابدأ بإضافة سيارة <ArrowUpLeft size={16}/></button></div><div className="hero-visual"><div className="hero-grid-lines"/><div className="hero-car"><CarFront size={116} strokeWidth={1.1}/></div><div className="hero-float float-top"><Check size={14}/> بيانات محفوظة</div><div className="hero-float float-bottom"><ImagePlus size={15}/> تجهيز الصور</div></div></section>
          <section className="section-head"><div><h2>ابدأ بمهمة</h2><p>اختر ما تريد إنجازه، ومشكور يتولى الباقي.</p></div><span className="tiny-note">أدوات محلية</span></section>
          <section className="action-grid">
            <button className="action-tile" onClick={()=>{setScreen('studio');}}><div className="tile-icon tile-lilac"><ImagePlus size={22}/></div><div><b>تجهيز صور السيارة</b><small>تحسين وضغط الصور وحفظ الجودة</small></div><ArrowUpLeft size={17}/></button>
            <button className="action-tile" onClick={()=>{setScreen('cars');setShowVehicleForm(true);}}><div className="tile-icon tile-blue"><CarFront size={22}/></div><div><b>إضافة سيارة</b><small>سجل بيانات السيارة مرة واحدة</small></div><ArrowUpLeft size={17}/></button>
            <button className="action-tile" onClick={()=>setScreen('assistant')}><div className="tile-icon tile-green"><WandSparkles size={22}/></div><div><b>اطلب من مساعد مشكور</b><small>صف النتيجة التي تريدها</small></div><ArrowUpLeft size={17}/></button>
          </section>
          <section className="section-head inventory-head"><div><h2>سيارات المعرض</h2><p>مسوداتك وسجلك في مكان واحد.</p></div><button className="quiet-link" onClick={()=>setScreen('cars')}>عرض المخزون <ArrowUpLeft size={15}/></button></section>
          {vehicles.length===0?<div className="empty-inventory"><div className="empty-car"><CarFront size={27}/></div><b>لم تضف سيارات بعد</b><span>ابدأ بإضافة أول سيارة إلى مساحة معرضك.</span><button className="button-outline" onClick={()=>{setScreen('cars');setShowVehicleForm(true);}}><Plus size={16}/> إضافة أول سيارة</button></div>:<div className="vehicle-grid">{vehicles.slice(0,3).map(v=><VehicleCard key={v.id} vehicle={v} onAd={()=>generateAd(v)} onEdit={()=>startEditVehicle(v)} onPublish={()=>publishVehicle(v)} busy={busy&&selectedVehicle===v.id}/>)}</div>}
        </>}
        {screen==='cars'&&<><section className="page-intro"><div><div className="overline"><span/> سجل موحد</div><h1>السيارات والإعلانات</h1><p>أدخل بيانات السيارة مرة واحدة، وأعد استخدامها في كل إعلان.</p></div><button className="button-primary" onClick={()=>{if(!showVehicleForm){setEditingVehicleId('');setNewVehicle({make:'',model:'',trim:'',year:'',mileage:'',fuel:'',transmission:'',color:'',price:'',city:'جدة',notes:''});}setShowVehicleForm(!showVehicleForm);}}><Plus size={18}/> إضافة سيارة</button></section>
          {showVehicleForm&&<form className="form-panel" onSubmit={addVehicle}><div className="form-heading"><div><b>{editingVehicleId?'تعديل بيانات السيارة':'بيانات السيارة'}</b><small>الحقول غير المتوفرة اتركها فارغة.</small></div><button type="button" onClick={()=>{setShowVehicleForm(false);setEditingVehicleId('');}}><X size={18}/></button></div><div className="form-grid"><label>الماركة *<input required value={newVehicle.make} onChange={e=>setNewVehicle({...newVehicle,make:e.target.value})} placeholder="تويوتا"/></label><label>الطراز *<input required value={newVehicle.model} onChange={e=>setNewVehicle({...newVehicle,model:e.target.value})} placeholder="كامري"/></label><label>الفئة<input value={newVehicle.trim} onChange={e=>setNewVehicle({...newVehicle,trim:e.target.value})} placeholder="GLE / LE"/></label><label>السنة<input type="number" min="1950" max="2100" value={newVehicle.year} onChange={e=>setNewVehicle({...newVehicle,year:e.target.value})} placeholder="2022"/></label><label>الممشى (كم)<input type="number" min="0" value={newVehicle.mileage} onChange={e=>setNewVehicle({...newVehicle,mileage:e.target.value})} placeholder="85000"/></label><label>الوقود<input value={newVehicle.fuel} onChange={e=>setNewVehicle({...newVehicle,fuel:e.target.value})} placeholder="بنزين"/></label><label>ناقل الحركة<input value={newVehicle.transmission} onChange={e=>setNewVehicle({...newVehicle,transmission:e.target.value})} placeholder="أوتوماتيك"/></label><label>اللون<input value={newVehicle.color} onChange={e=>setNewVehicle({...newVehicle,color:e.target.value})} placeholder="أبيض"/></label><label>السعر (ر.س)<input type="number" min="0" value={newVehicle.price} onChange={e=>setNewVehicle({...newVehicle,price:e.target.value})} placeholder="85000"/></label><label>المدينة / الموقع<input value={newVehicle.city} onChange={e=>setNewVehicle({...newVehicle,city:e.target.value})} placeholder="جدة، الحي أو العنوان"/></label><label className="form-full-width">ملاحظات<input value={newVehicle.notes} onChange={e=>setNewVehicle({...newVehicle,notes:e.target.value})} placeholder="ملاحظات إضافية موثقة عن السيارة"/></label></div><div className="form-actions"><button className="button-primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>} {editingVehicleId?'حفظ التعديلات':'حفظ السيارة'}</button><button type="button" className="button-text" onClick={()=>{setShowVehicleForm(false);setEditingVehicleId('');}}>إلغاء</button></div></form>}
          {adDraft&&<div className="draft-panel"><div className="draft-head"><div><span className="draft-tag">مسودة إعلان</span><b>تم تجهيز النص من بيانات السيارة</b></div><button onClick={()=>navigator.clipboard?.writeText(adDraft)}><ArrowDownToLine size={15}/> نسخ النص</button></div><pre>{adDraft}</pre>{adValidation?.missingFields?.length>0&&<div className="draft-warning"><b>بيانات تحتاج استكمالاً</b><span>{adValidation.missingFields.map((field:string)=>({make:'الماركة',model:'الطراز',year:'السنة',mileage:'الممشى',fuel:'الوقود',transmission:'ناقل الحركة',color:'اللون',price:'السعر',city:'الموقع'}[field]||field).join('، '))}</span></div>}{adValidation?.warnings?.length>0&&<div className="draft-warning"><b>ملاحظات التحقق</b><span>{adValidation.warnings.join('، ')}</span></div>}<small>هذه مسودة فقط. راجع البيانات قبل نشرها على أي منصة.</small></div>}
          {vehicles.length===0?<div className="empty-inventory"><div className="empty-car"><CarFront size={27}/></div><b>مخزونك فارغ حالياً</b><span>أضف أول سيارة حتى تبدأ تجهيز إعلاناتها.</span><button className="button-outline" onClick={()=>setShowVehicleForm(true)}><Plus size={16}/> إضافة سيارة</button></div>:<div className="vehicle-grid">{vehicles.map(v=><VehicleCard key={v.id} vehicle={v} onAd={()=>generateAd(v)} onEdit={()=>startEditVehicle(v)} onPublish={()=>publishVehicle(v)} busy={busy&&selectedVehicle===v.id}/>)}</div>}
        </>}
        {screen==='studio'&&<><section className="page-intro"><div><div className="overline"><span/> معالجة محلية</div><h1>استوديو الصور</h1><p>جهّز صور السيارة دون إرسالها إلى خدمة ذكاء اصطناعي مدفوعة.</p></div></section><div className="studio-panel"><div className="studio-header"><div className="tile-icon tile-lilac"><ImagePlus size={22}/></div><div><b>أدوات تجهيز الصورة</b><small>اختر الصورة ثم نفّذ المهمة التي تحتاجها.</small></div><span className="local-chip"><i/> محلي</span></div>{vehicles.length>0&&<div className="vehicle-photo-library"><div className="photo-library-controls"><label>ملف السيارة<select value={assetVehicleId} onChange={e=>setAssetVehicleId(e.target.value)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.year||""} {v.make} {v.model}</option>)}</select></label><label className="button-outline photo-multi-upload"><Upload size={15}/>{assetUploadBusy?"جارٍ حفظ الصور...":"إضافة صور متعددة"}<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={assetUploadBusy} onChange={e=>{uploadVehiclePhotos(e.target.files);e.currentTarget.value="";}} hidden/></label></div>{vehicleAssets.length>0?<div className="vehicle-photo-strip">{vehicleAssets.map((asset:any)=><button key={asset.id} className="vehicle-photo-thumb" onClick={async()=>{const response=await fetch(asset.url);const blob=await response.blob();const file=new File([blob],"vehicle-photo."+((blob.type.split("/")[1])||"jpg"),{type:blob.type});chooseImage(file);}}><img src={asset.url} alt="صورة محفوظة للسيارة"/><span>فتح في الاستوديو</span></button>)}</div>:<p className="photo-library-empty">لم تُحفظ صور لهذه السيارة بعد. أضف مجموعة صور مرة واحدة.</p>}{vehicleAssets.some((a:any)=>a.asset_role!=='derived')&&<div className="photo-batch-action"><button className="button-primary" disabled={batchBusy} onClick={optimizeVehicleBatch}>{batchBusy?<LoaderCircle className="spin" size={15}/>:<WandSparkles size={15}/>} تجهيز كل الصور بالتسلسل</button><small>{batchStatus||"تحسين WebP لكل الصور مع حفظ الأصل والنتيجة منفصلين."}</small></div>}}</div>}<label className="upload-zone">{imageData?<img src={imageData} alt="الصورة الأصلية"/>:<><div className="upload-symbol"><Upload size={24}/></div><b>اختر صورة السيارة</b><span>PNG أو JPG أو WebP · حتى 12 ميجابايت</span></>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>chooseImage(e.target.files?.[0])} hidden/></label>{imageData&&<div className="region-selector-wrap"><div><b>حدد منطقة الطمس</b><small>اسحب فوق اللوحة أو أي منطقة تريد إخفاءها.</small></div><ImageRegionSelector key={imageData} src={imageData} onSelect={setSelectedRegion}/></div>}<div className="tool-options"><div className="tool-option"><div><b>إزالة الخلفية</b><small>BiRefNet · يعمل على جهازك · تنزيل أول مرة نحو 98 ميجابايت</small></div><button className="button-primary" disabled={!imageFile||bgBusy} onClick={removeBackgroundLocal}>{bgBusy?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>} إزالة الخلفية</button></div><div className="tool-option"><div><b>تحسين وضغط الصورة</b><small>تصحيح الاتجاه وتحويل WebP على خادمك الخاص.</small></div><button className="button-outline" disabled={!imageData||imageBusy} onClick={optimizeImage}>{imageBusy?<LoaderCircle className="spin" size={16}/>:<ImagePlus size={16}/>} تحسين الصورة</button></div><div className="tool-option"><div><b>طمس اللوحة أو منطقة محددة</b><small>حدد المستطيل يدوياً فوق الصورة؛ لا يوجد كشف تلقائي حتى الآن.</small></div><button className="button-outline" disabled={!imageData||blurBusy} onClick={blurSelectedRegion}>{blurBusy?<LoaderCircle className="spin" size={16}/>:<ShieldCheck size={16}/>} طمس المنطقة</button></div></div>{bgBusy&&<div className="model-progress"><div><span>{bgProgress.message||'جارٍ تجهيز النموذج...'}</span><b>{Math.round(bgProgress.progress*100)}%</b></div><div className="progress-track"><i style={{width:Math.round(bgProgress.progress*100)+'%'}}/></div></div>}{(optimizedImage||removedImage||blurredImage)&&<div className={`image-result ${removedImage||blurredImage?'image-result-three':''}`}><div><span>الأصل</span><img src={imageData} alt="الأصل"/></div>{removedImage&&<div><span>خلفية شفافة</span><img className="transparent-preview" src={removedImage} alt="السيارة بعد إزالة الخلفية"/></div>}{optimizedImage&&<div><span>WebP محسن</span><img src={optimizedImage} alt="الصورة المحسنة"/></div>}{blurredImage&&<div><span>بعد الطمس</span><img src={blurredImage} alt="الصورة بعد طمس المنطقة"/></div>}</div>}<div className="studio-actions">{removedImage&&<a className="button-outline" href={removedImage} download="mshkur-background-removed.png"><ArrowDownToLine size={16}/> تنزيل PNG شفاف</a>}{optimizedImage&&<a className="button-outline" href={optimizedImage} download="mshkur-optimized.webp"><ArrowDownToLine size={16}/> تنزيل WebP</a>}{blurredImage&&<a className="button-outline" href={blurredImage} download="mshkur-blurred.png"><ArrowDownToLine size={16}/> تنزيل الصورة المطموسة</a>}</div><p className="studio-foot"><ShieldCheck size={15}/> إزالة الخلفية تتم داخل المتصفح. تحسين WebP يتم على خادم مشكور. الأصل لا يُستبدل في الحالتين.</p></div></>}
        {screen==='assistant'&&<><section className="page-intro"><div><div className="overline"><span/> مدير المهام</div><h1>مساعد مشكور</h1><p>اكتب ما تريد إنجازه. سيقترح المحرك مهارة محلية مناسبة إن توفرت.</p></div></section><div className="assistant-panel"><div className="assistant-avatar"><Sparkles size={22}/></div><div className="assistant-greeting"><b>كيف أساعدك اليوم؟</b><p>أفهم طلبك وأبحث عن مهارة متاحة. لن أنفذ إجراءً خارجياً دون موافقتك.</p></div><form onSubmit={planAssistant}><textarea value={assistantRequest} onChange={e=>setAssistantRequest(e.target.value)} placeholder="مثلاً: جهّز إعلاناً لسيارة تويوتا كامري 2022..." rows={4}/><div className="assistant-buttons"><button className="button-primary" disabled={busy||!assistantRequest.trim()}>{busy?<LoaderCircle className="spin" size={16}/>:<Sparkles size={16}/>} حلّل الطلب</button><button type="button" className="button-outline" disabled={assistantModelBusy||!assistantRequest.trim()} onClick={chatWithLocalModel}>{assistantModelBusy?<LoaderCircle className="spin" size={16}/>:<Zap size={16}/>} اسأل النموذج المحلي</button></div></form>{assistantReply&&<div className="assistant-reply"><b>رد النموذج المحلي</b><p>{assistantReply}</p></div>}{assistantPlan&&<div className="plan-result">{assistantPlan.intent.matched?<><span className="plan-match"><Check size={15}/> وجدت مهارة مناسبة</span><b>{assistantPlan.intent.skillId}</b><p>المحرك يوصي بهذه المهارة. انتقل إلى القسم المناسب وأدخل بياناتها قبل التنفيذ.</p><button className="button-outline" onClick={()=>setScreen(assistantPlan.intent.skillId.includes('image')||assistantPlan.intent.skillId.includes('blur')||assistantPlan.intent.skillId.includes('background')?'studio':'cars')}>فتح الأداة <ArrowUpLeft size={15}/></button></>:<><b>لم أجد مهارة مطابقة بعد</b><p>{assistantPlan.intent.message}</p></>}</div>}</div><div className="assistant-note"><Zap size={16}/><span>المحرك يعمل حالياً بمهارات محلية محددة. النموذج المفتوح المصدر اختياري ولا يوجد fallback مدفوع.</span></div><div className="agent-roster"><div className="section-head"><div><h2>فريق التنفيذ</h2><p>تخصصات تعمل عند الحاجة إلى المهمة.</p></div><span className="tiny-note">{agents.length} مساعدين</span></div><div className="agent-grid">{agents.map(agent=><div className="agent-card" key={agent.id}><div className="agent-mark">{agent.id==='maestro'?<Sparkles size={19}/>:agent.id==='vehicle-specialist'?<CarFront size={19}/>:agent.id==='photo-specialist'?<ImagePlus size={19}/>:<ShieldCheck size={19}/>}</div><div><b>{agent.name}</b><small>{agent.title}</small><p>{agent.description}</p></div><span>{agent.skills.length} مهارات</span></div>)}</div></div></>}
        {screen==='growth'&&<GrowthPanel/>}
        {screen==='inbox'&&<InboxPanel/>}
        {screen==='admin'&&(user.role==='owner'||user.role==='admin')&&<OperationsPanel/>}
        <footer className="page-footer">مشكور <span>مساحة عمل بسيطة، ونتائج حقيقية.</span><span className="version-label">BUILD 0.2</span></footer>
      </div>
    </main>
  </div>;
}


function paintRegion(canvas:HTMLCanvasElement,image:HTMLImageElement,region:{left:number;top:number;width:number;height:number}){
  if(canvas.width!==image.naturalWidth)canvas.width=image.naturalWidth;
  if(canvas.height!==image.naturalHeight)canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);
  const x=region.left*canvas.width,y=region.top*canvas.height,w=region.width*canvas.width,h=region.height*canvas.height;
  ctx.fillStyle='rgba(220,70,70,.28)';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#e65f58';ctx.lineWidth=Math.max(2,canvas.width/500);ctx.strokeRect(x,y,w,h);
}
function ImageRegionSelector({src,onSelect}:{src:string;onSelect:(region:{left:number;top:number;width:number;height:number})=>void}){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const imageRef=useRef<HTMLImageElement|null>(null);
  const startRef=useRef<{x:number;y:number}|null>(null);
  const [region,setRegion]=useState({left:0.3,top:0.55,width:0.4,height:0.18});
  const regionRef=useRef(region);
  useEffect(()=>{
    regionRef.current=region;
    if(canvasRef.current&&imageRef.current)paintRegion(canvasRef.current,imageRef.current,region);
  },[region]);
  useEffect(()=>{
    const image=new Image();
    image.onload=()=>{
      imageRef.current=image;
      if(canvasRef.current)paintRegion(canvasRef.current,image,regionRef.current);
    };
    image.src=src;
    return ()=>{image.onload=null;};
  },[src]);
  function point(event:PointerEvent<HTMLCanvasElement>){
    const rect=event.currentTarget.getBoundingClientRect();
    return {x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};
  }
  function move(event:PointerEvent<HTMLCanvasElement>){
    if(!startRef.current)return;
    const p=point(event),s=startRef.current;
    setRegion({left:Math.min(s.x,p.x),top:Math.min(s.y,p.y),width:Math.max(.01,Math.abs(p.x-s.x)),height:Math.max(.01,Math.abs(p.y-s.y))});
  }
  function end(event:PointerEvent<HTMLCanvasElement>){
    if(!startRef.current)return;
    const p=point(event),s=startRef.current;
    const next={left:Math.min(s.x,p.x),top:Math.min(s.y,p.y),width:Math.max(.01,Math.abs(p.x-s.x)),height:Math.max(.01,Math.abs(p.y-s.y))};
    startRef.current=null;setRegion(next);onSelect(next);
  }
  return <canvas ref={canvasRef} className="region-canvas" onPointerDown={event=>{startRef.current=point(event);event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{startRef.current=null;}} aria-label="اسحب لتحديد المنطقة المراد طمسها"/>;
}
function VehicleCard({vehicle,onAd,onEdit,onPublish,busy}:{vehicle:Vehicle;onAd:()=>void;onEdit:()=>void;onPublish:()=>void;busy:boolean}){
  return <article className="vehicle-card"><div className="vehicle-card-art"><CarFront size={40}/><span>مسودة</span></div><div className="vehicle-card-body"><b>{[vehicle.year,vehicle.make,vehicle.model,vehicle.trim].filter(Boolean).join(' ')}</b><small>{[vehicle.city,vehicle.mileage?new Intl.NumberFormat('ar-SA').format(vehicle.mileage)+' كم':null].filter(Boolean).join(' · ')||'بيانات أولية'}</small>{vehicle.city&&<a className="vehicle-map-link" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(vehicle.city)} target="_blank" rel="noreferrer"><MapPin size={12}/> فتح الموقع على الخرائط</a>}<div className="vehicle-card-bottom"><strong>{vehicle.price?new Intl.NumberFormat('ar-SA').format(vehicle.price)+' ر.س':'السعر غير محدد'}</strong><div className="vehicle-card-buttons"><button className="vehicle-edit-button" onClick={onEdit}>تعديل</button><button className="vehicle-edit-button" onClick={onPublish}>نشر الصفحة</button><button onClick={onAd} disabled={busy}>{busy?<LoaderCircle size={15} className="spin"/>:<FileText size={15}/>} تجهيز الإعلان</button></div></div></div></article>;
}

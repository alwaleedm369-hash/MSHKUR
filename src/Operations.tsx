import { useEffect, useState } from 'react';
import { Activity, MapPin, MessageCircle, Users, CarFront, Image, ShieldCheck, ExternalLink, RefreshCw, Search } from 'lucide-react';

async function api<T=any>(url:string, options:RequestInit={}):Promise<T>{
  const r=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const body=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(body.message||body.error||'تعذر تحميل البيانات');
  return body as T;
}
export function OperationsPanel(){
  const [data,setData]=useState<any>(null),[error,setError]=useState('');
  const load=()=>api('/api/admin/overview').then(setData).catch(e=>setError(e.message));
  useEffect(()=>{load();},[]);
  return <section className="ops-panel" dir="rtl">
    <div className="ops-heading"><div><span>مركز المالك</span><h2>التشغيل والإدارة</h2><small>ملخص مساحة العمل والمهام والموافقات</small></div><button onClick={load}><RefreshCw size={16}/> تحديث</button></div>
    {error&&<p className="ops-error">{error}</p>}
    {data&&<><div className="ops-metrics">{[['السيارات',data.summary.vehicles,CarFront],['صور السيارات',data.summary.media,Image],['المهام',data.summary.jobs,Activity],['موافقات معلقة',data.summary.pendingApprovals,ShieldCheck],['استفسارات العملاء',data.summary.leads,Users],['محادثات مفتوحة',data.summary.conversations,MessageCircle]].map(([label,value,Icon]:any)=><div className="ops-metric" key={label}><Icon size={18}/><small>{label}</small><b>{value}</b></div>)}</div><h3>الحدود اليومية المجانية</h3><div className="ops-quotas">{Object.entries(data.usage).map(([key,v]:any)=><div key={key}><span>{({image_jobs:'معالجة الصور',ad_drafts:'مسودات الإعلانات',assistant_messages:'رسائل المساعد'} as any)[key]||key}</span><b>{v.used} / {v.limit}</b><i><em style={{width:(v.used/v.limit*100)+'%'}}/></i></div>)}</div></>}
  </section>;
}
export function GrowthPanel(){
  const [city,setCity]=useState('جدة'),[kind,setKind]=useState('car_dealers'),[result,setResult]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function search(){setBusy(true);setError('');try{setResult(await api('/api/marketing/map-search',{method:'POST',body:JSON.stringify({city,kind})}));}catch(e){setError(e instanceof Error?e.message:'تعذر البحث');}finally{setBusy(false);}}
  return <section className="ops-panel" dir="rtl"><div className="ops-heading"><div><span>مساعدو التسويق</span><h2>اكتشاف العملاء عبر الخريطة</h2><small>جهّز بحثاً محلياً وافتح النتائج في خرائط Google</small></div><MapPin size={22}/></div><div className="growth-form"><label>المدينة<input value={city} onChange={e=>setCity(e.target.value)} placeholder="جدة"/></label><label>نوع النشاط<select value={kind} onChange={e=>setKind(e.target.value)}><option value="car_dealers">معارض سيارات</option><option value="car_detailing">تجهيز وتلميع سيارات</option><option value="used_cars">تجار السيارات المستعملة</option><option value="service_centers">مراكز خدمة السيارات</option></select></label><button onClick={search} disabled={busy||!city.trim()}><Search size={16}/>{busy?'جارٍ التجهيز':'ابحث في الخريطة'}</button></div>{error&&<p className="ops-error">{error}</p>}{result&&<div className="growth-result"><b>{result.query}</b><p>{result.note}</p><a href={result.googleMapsUrl} target="_blank" rel="noreferrer">فتح نتائج خرائط Google <ExternalLink size={14}/></a></div>}<p className="ops-note">المساعد يجهز لك منطقة الاستهداف فقط. لا يجمع أرقام أشخاص ولا يرسل رسائل تسويقية آلية. راجع النتائج وتواصل مع العملاء بموافقتك.</p></section>;
}
export function InboxPanel(){
  const [data,setData]=useState<any>(null),[error,setError]=useState('');
  const load=()=>api('/api/inbox').then(setData).catch(e=>setError(e.message));
  useEffect(()=>{load();},[]);
  return <section className="ops-panel" dir="rtl"><div className="ops-heading"><div><span>متابعة العملاء</span><h2>الوارد والمحادثات</h2><small>محادثات الموقع التي تحتاج متابعة بشرية</small></div><button onClick={load}><RefreshCw size={16}/> تحديث</button></div>{error&&<p className="ops-error">{error}</p>}{data&&data.conversations.length===0&&<p className="ops-note">لا توجد محادثات حتى الآن. ستظهر هنا رسائل زوار صفحات المعرض.</p>}{data?.conversations.map((item:any)=><article className="inbox-row" key={item.id}><MessageCircle size={18}/><div><b>{item.channel==='web'?'محادثة الموقع':'محادثة '+item.channel}</b><p>{item.last_message}</p><small>{new Date(item.updated_at).toLocaleString('ar-SA')}</small></div><span>{item.status==='open'?'مفتوحة':'مغلقة'}</span></article>)}</section>;
}

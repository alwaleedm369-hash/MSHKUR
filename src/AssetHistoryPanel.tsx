import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Clock3, Image as ImageIcon, Layers3 } from 'lucide-react';

type Asset={id:string;file_id:string;original_file_id?:string|null;asset_role:string;processing_status?:string|null;created_at?:string;url:string};
export default function AssetHistoryPanel({assets,onOpen}:{assets:Asset[];onOpen:(assetId:string)=>void}){
  const originals=useMemo(()=>assets.filter(a=>a.asset_role!=='derived'),[assets]);
  const [originalId,setOriginalId]=useState('');
  const [derivedId,setDerivedId]=useState('');
  const [position,setPosition]=useState(50);
  const original=originals.find(a=>a.id===originalId)||originals[0];
  const versions=useMemo(()=>original?assets.filter(a=>a.asset_role==='derived'&&a.original_file_id===original.file_id):[],[assets,original]);
  const derived=versions.find(a=>a.id===derivedId)||versions[versions.length-1];
  useEffect(()=>{if(!originals.some(a=>a.id===originalId))setOriginalId(originals[0]?.id||'');},[originals,originalId]);
  useEffect(()=>{if(!versions.some(a=>a.id===derivedId))setDerivedId(versions[versions.length-1]?.id||'');},[versions,derivedId]);
  const label=(status?:string|null)=>({background_removed:'إزالة الخلفية',optimized:'تحسين WebP',blurred:'طمس',cropped:'قص',enhanced:'تحسين',glass_tinted:'تضليل الزجاج'} as Record<string,string>)[status||'']||'نسخة معالجة';
  return <section className="asset-history-panel" dir="rtl">
    <div className="asset-history-heading"><div><span>سجل الصورة</span><b><Layers3 size={17}/> مقارنة وإصدارات</b><small>الأصل محفوظ دائماً، وكل معالجة نسخة مستقلة</small></div><Clock3 size={18}/></div>
    {originals.length===0?<p className="asset-history-empty">أضف صور السيارة لعرض سجل النسخ.</p>:<>
      <label className="asset-history-select">الصورة الأصلية<select value={original?.id||''} onChange={e=>{setOriginalId(e.target.value);setDerivedId('');setPosition(50);}}>{originals.map(a=><option key={a.id} value={a.id}>{a.id.slice(0,8)} · {a.created_at?new Date(a.created_at).toLocaleDateString('ar-SA'):'صورة أصلية'}</option>)}</select></label>
      {derived&&original?<>
        <label className="asset-history-select">النسخة المعالجة<select value={derived.id} onChange={e=>setDerivedId(e.target.value)}>{versions.map(a=><option key={a.id} value={a.id}>{label(a.processing_status)} · {a.created_at?new Date(a.created_at).toLocaleString('ar-SA'):'نسخة'}</option>)}</select></label>
        <div className="asset-compare-stage">
          <img className="asset-compare-before" src={original.url} alt="الصورة الأصلية"/>
          <div className="asset-compare-after" style={{clipPath:`inset(0 ${100-position}% 0 0)`}}><img src={derived.url} alt="النسخة المعالجة"/></div>
          <div className="asset-compare-line" style={{left:position+'%'}}><i/></div>
          <span className="asset-compare-tag before">الأصل</span><span className="asset-compare-tag after">بعد المعالجة</span>
        </div>
        <label className="asset-compare-range"><ArrowLeftRight size={14}/> حرّك للمقارنة <input type="range" min="0" max="100" value={position} onChange={e=>setPosition(Number(e.target.value))}/></label>
      </>:<div className="asset-history-empty"><ImageIcon size={21}/><span>لا توجد نسخة معالجة مرتبطة بهذه الصورة بعد.</span></div>}
      <div className="asset-version-list"><b>الإصدارات المرتبطة ({versions.length})</b>{versions.length===0?<small>ستظهر هنا كل نتيجة تحفظها من أدوات الاستوديو.</small>:versions.map((asset,index)=><article key={asset.id} className={asset.id===derived?.id?'selected':''}><img src={asset.url} alt="نسخة معالجة"/><div><b>{label(asset.processing_status)}</b><small>{asset.created_at?new Date(asset.created_at).toLocaleString('ar-SA'):'تاريخ غير متاح'} · v{index+1}</small></div><button type="button" onClick={()=>onOpen(asset.id)}>فتح في الاستوديو</button></article>)}</div>
    </>}
  </section>;
}

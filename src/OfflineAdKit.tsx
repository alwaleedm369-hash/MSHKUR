import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Image as ImageIcon, LoaderCircle } from 'lucide-react';

type Vehicle={make:string;model:string;trim?:string|null;year?:number|null;mileage?:number|null;fuel?:string|null;transmission?:string|null;color?:string|null;price?:number|null;city?:string|null;notes?:string|null};
type Asset={id:string;url:string;asset_role:string;processing_status?:string|null};
const escapeHtml=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const readAsDataUrl=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('تعذر قراءة إحدى الصور'));reader.readAsDataURL(blob);});
export default function OfflineAdKit({vehicle,assets}:{vehicle:Vehicle;assets:Asset[]}){
  const candidates=useMemo(()=>assets.slice().sort((a,b)=>(a.asset_role==='derived'?1:0)-(b.asset_role==='derived'?1:0)),[assets]);
  const [selected,setSelected]=useState<string[]>([]);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  useEffect(()=>{setSelected(candidates.filter(asset=>asset.asset_role!=='derived').slice(0,12).map(asset=>asset.id));},[candidates]);
  async function exportKit(){
    const chosen=candidates.filter(asset=>selected.includes(asset.id)).slice(0,12);
    if(!chosen.length){setFeedback('اختر صورة واحدة على الأقل.');return;}
    setBusy(true);setFeedback('جارٍ تجهيز الصور والملف...');
    try{
      const photos=await Promise.all(chosen.map(async asset=>{
        const response=await fetch(asset.url);if(!response.ok)throw new Error('تعذر تحميل إحدى الصور');
        return {data:await readAsDataUrl(await response.blob()),status:asset.processing_status||'original'};
      }));
      const title=[vehicle.year,vehicle.make,vehicle.model,vehicle.trim].filter(Boolean).join(' ');
      const fields=[['السنة',vehicle.year],['الممشى',vehicle.mileage!==null&&vehicle.mileage!==undefined?new Intl.NumberFormat('ar-SA').format(vehicle.mileage)+' كم':null],['الوقود',vehicle.fuel],['ناقل الحركة',vehicle.transmission],['اللون',vehicle.color],['المدينة',vehicle.city],['السعر',vehicle.price!==null&&vehicle.price!==undefined?new Intl.NumberFormat('ar-SA').format(vehicle.price)+' ريال':null]].filter(([,value])=>value!==null&&value!==undefined&&value!=='');
      const photoHtml=photos.map((photo,index)=>`<figure><img src="${photo.data}" alt="صورة السيارة ${index+1}"><figcaption>${escapeHtml(photo.status)}</figcaption></figure>`).join('');
      const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f5f3;color:#25352b;font-family:Arial,Tahoma,sans-serif}.page{max-width:980px;margin:28px auto;padding:28px;background:#fff;border-radius:18px}.top{display:flex;justify-content:space-between;gap:20px;align-items:start;border-bottom:1px solid #e5ebe6;padding-bottom:18px}.brand{font-size:12px;color:#65816d;letter-spacing:.12em}.price{font-size:23px;font-weight:700;color:#245a39}.specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:22px 0}.spec{padding:12px;background:#f4f7f4;border-radius:10px}.spec small{display:block;color:#819087;margin-bottom:5px}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.gallery figure{margin:0;border:1px solid #e5ebe6;border-radius:12px;overflow:hidden}.gallery img{display:block;width:100%;height:260px;object-fit:contain;background:#eef1ef}.gallery figcaption{padding:8px;color:#809087;font-size:11px}.notes{white-space:pre-wrap;line-height:1.8;margin-top:22px}@media(max-width:600px){.page{margin:0;padding:16px;border-radius:0}.gallery{grid-template-columns:1fr}.gallery img{height:230px}}@media print{body{background:#fff}.page{margin:0;max-width:none;border-radius:0}.gallery img{height:220px}}</style></head><body><main class="page"><header class="top"><div><div class="brand">MSHKUR · CAR AD KIT</div><h1>${escapeHtml(title)}</h1></div><div class="price">${vehicle.price!==null&&vehicle.price!==undefined?escapeHtml(new Intl.NumberFormat('ar-SA').format(vehicle.price)+' ريال'):'السعر عند التواصل'}</div></header><section class="specs">${fields.map(([label,value])=>`<div class="spec"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></div>`).join('')}</section><section class="gallery">${photoHtml}</section>${vehicle.notes?'<section class="notes"><h2>ملاحظات</h2>'+escapeHtml(vehicle.notes)+'</section>':''}<p class="brand">تم تجهيز هذا الملف محلياً بواسطة MSHKUR. راجع بيانات السيارة والصور قبل النشر.</p></main></body></html>`;
      const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='mshkur-ad-kit.html';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);
      setFeedback('تم تنزيل ملف إعلان مستقل يحتوي الصور المختارة والبيانات المؤكدة.');
    }catch(error){setFeedback(error instanceof Error?error.message:'تعذر تجهيز الملف');}
    finally{setBusy(false);}
  }
  return <section className="offline-ad-kit" dir="rtl">
    <div className="offline-ad-kit-head"><div><span>تصدير محلي</span><b><FileText size={17}/> حزمة الإعلان</b><small>ملف HTML مستقل يعمل دون اتصال ويحتوي الصور المختارة</small></div><Download size={18}/></div>
    <div className="offline-ad-kit-grid">{candidates.map((asset,index)=><label key={asset.id} className={selected.includes(asset.id)?'chosen':''}><img src={asset.url} alt="صورة للتصدير"/><span><input type="checkbox" checked={selected.includes(asset.id)} onChange={e=>setSelected(current=>e.target.checked?[...current,asset.id]:current.filter(id=>id!==asset.id))}/><ImageIcon size={12}/> {asset.asset_role==='derived'?'نسخة معالجة':'أصلية'}</span></label>)}</div>
    <div className="offline-ad-kit-actions"><small>{selected.length} صور محددة · الحد الأقصى 12</small><button type="button" disabled={busy||!selected.length} onClick={exportKit}>{busy?<LoaderCircle size={15} className="spin"/>:<Download size={15}/>} تنزيل ملف الإعلان</button></div>
    {feedback&&<p>{feedback}</p>}
  </section>;
}

import { useState } from 'react';
import { ArrowLeft, ArrowUpLeft, CarFront, ImagePlus, Plus, Sparkles, ShieldCheck, WandSparkles, Camera, FileText, ScanFace } from 'lucide-react';
import { useLocale } from './i18n';

type Vehicle = { id:string; make:string; model:string; year?:number|null; price?:number|null; city?:string|null; mileage?:number|null; status:string };
type Asset = {id:string;url:string;asset_role?:string};
type Props = {
  name:string;
  vehicles:Vehicle[];
  assets:Asset[];
  onAddVehicle:()=>void;
  onStudio:()=>void;
  onAssistant:()=>void;
  onCars:()=>void;
};

export default function DashboardHome({name,vehicles,assets,onAddVehicle,onStudio,onAssistant,onCars}:Props){
  const { locale } = useLocale();
  const en = locale === 'en';
  const latest=vehicles[0];
  const [activeAsset,setActiveAsset]=useState(0);
  const activePhoto=assets[activeAsset]?.url;
  return <div className="car-home" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="car-home-heading">
      <div><span className="car-home-kicker"><i/> MSHKUR CARS · {en ? 'Workspace' : 'مساحة العمل'}</span><h1>{en ? `Hi ${name.split(' ')[0]}, prepare your vehicle.` : `أهلاً ${name.split(' ')[0]}، لنجهّز سيارتك.`}</h1><p>{en ? 'Choose a photo or start a task. Your tools are in one place.' : 'اختر صورة أو ابدأ بمهمة. كل أدواتك في مكان واحد.'}</p></div>
      <button className="car-home-add" onClick={onAddVehicle}><Plus size={17}/> {en ? 'New vehicle' : 'سيارة جديدة'}</button>
    </header>

    <section className="car-home-stage">
      <div className="car-home-stage-copy">
        <span className="car-home-stage-label"><Sparkles size={14}/> استوديو مشكور</span>
        <h2>صورتها أولاً.<br/><em>والباقي علينا.</em></h2>
        <p>ابدأ من صورة السيارة، ثم أزل الخلفية، أخفِ اللوحة، حسّن التفاصيل، وجهّز إعلانك.</p>
        <div className="car-home-stage-actions">
          <button className="car-home-primary" onClick={onStudio}><ImagePlus size={17}/> افتح استوديو الصور <ArrowLeft size={16}/></button>
          <button className="car-home-secondary" onClick={onAddVehicle}><Plus size={16}/> إضافة سيارة</button>
        </div>
        <div className="car-home-trust"><ShieldCheck size={15}/> الأصل محفوظ · لا نشر دون موافقتك</div>
      </div>
      <div className="car-home-visual" aria-label="مساحة عرض صورة السيارة">
        <div className="car-home-visual-glow"/>
        <div className="car-home-visual-grid"/>
        <div className="car-home-visual-frame">
          <div className="car-home-visual-top"><span><i/> مساحة الصورة</span><small>{latest ? 'جاهز لإضافة الصور' : 'بانتظار أول سيارة'}</small></div>
          <div className="car-home-car-art">{activePhoto ? <img src={activePhoto} alt="صورة السيارة المختارة"/> : <CarFront strokeWidth={1.05}/>}</div>
          <div className="car-home-visual-bottom"><span>01 / صورة السيارة</span><span>STUDIO PREVIEW</span></div>
        </div>
        {assets.length>1&&<div className="car-home-thumbs">{assets.slice(0,6).map((asset,index)=><button key={asset.id} className={activeAsset===index?"active":""} onClick={()=>setActiveAsset(index)} aria-label={`عرض الصورة ${index+1}`}><img src={asset.url} alt=""/></button>)}</div>}
        <div className="car-home-floating car-home-float-a"><WandSparkles size={15}/> تجهيز ذكي</div>
        <div className="car-home-floating car-home-float-b"><ShieldCheck size={15}/> مراجعتك أولاً</div>
      </div>
    </section>

    <section className="car-home-tools">
      <div className="car-home-section-title"><div><span>ابدأ من هنا</span><h2>ماذا تريد أن تفعل؟</h2></div><small>الأدوات الأساسية</small></div>
      <div className="car-home-tool-grid">
        <button onClick={onStudio}><span className="car-home-tool-icon"><WandSparkles size={21}/></span><b>إزالة الخلفية</b><small>اعزل السيارة بخلفية شفافة</small><ArrowUpLeft size={16}/></button>
        <button onClick={onStudio}><span className="car-home-tool-icon"><ScanFace size={21}/></span><b>طمس اللوحة</b><small>حدد اللوحة وراجع النتيجة</small><ArrowUpLeft size={16}/></button>
        <button onClick={onStudio}><span className="car-home-tool-icon"><Sparkles size={21}/></span><b>تحسين الصورة</b><small>حسّن الجودة والإضاءة</small><ArrowUpLeft size={16}/></button>
        <button onClick={onAssistant}><span className="car-home-tool-icon"><FileText size={21}/></span><b>تجهيز الإعلان</b><small>أنشئ مسودة من بيانات مؤكدة</small><ArrowUpLeft size={16}/></button>
      </div>
    </section>

    <section className="car-home-library">
      <div className="car-home-section-title"><div><span>أعمالك</span><h2>سياراتك وألبوماتها</h2></div><button onClick={onCars}>عرض الكل <ArrowLeft size={15}/></button></div>
      {latest ? <button className="car-home-vehicle" onClick={onCars}>
        <span className="car-home-vehicle-thumb"><CarFront size={27}/></span>
        <span className="car-home-vehicle-info"><b>{[latest.year,latest.make,latest.model].filter(Boolean).join(' ')}</b><small>{[latest.city,latest.mileage?new Intl.NumberFormat('ar-SA').format(latest.mileage)+' كم':null].filter(Boolean).join(' · ')||'افتح ألبوم السيارة'}</small></span>
        <span className="car-home-vehicle-open">فتح الألبوم <ArrowLeft size={14}/></span>
      </button> : <button className="car-home-empty" onClick={onAddVehicle}><span><Camera size={22}/></span><b>أضف أول سيارة إلى ألبومك</b><small>ستجد صورها الأصلية والنسخ المجهزة هنا.</small><em>إضافة سيارة <ArrowLeft size={15}/></em></button>}
      {vehicles.length>1&&<small className="car-home-count">{vehicles.length} سيارات محفوظة في مساحة العمل</small>}
    </section>
  </div>;
}

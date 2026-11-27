import { useMemo, useState } from 'react';
import {
  Activity, ArrowDown, ArrowLeft, ArrowUp, Blocks, BookOpen, Check, ChevronLeft,
  CircleHelp, Clock3, Code2, Film, Headphones, LayoutDashboard, ListChecks,
  LockKeyhole, MessageSquare, Mic2, MoreHorizontal, Network, Plus, Search,
  Settings2, ShieldCheck, Sparkles, Workflow, X, Zap
} from 'lucide-react';
import './skills-workbench.css';

type Kind = 'skill' | 'extension';
type Item = { id:string; name:string; subtitle:string; description:string; category:string; status:string; kind:Kind; icon:string; detail:string; requirements:string[] };

const skills:Item[] = [
  {id:'board',name:'مجلس الإدارة',subtitle:'تقييم الفكرة من زوايا استراتيجية متعددة',description:'محاكاة وجهات نظر استشارية مختلفة لمراجعة الفكرة وتحدياتها.',category:'تقييم المشاريع',status:'موصوفة',kind:'skill',icon:'✦',detail:'تجمع الملاحظات في محاور: وضوح المشكلة، التميز، قابلية التنفيذ، والمخاطر. الأدوار محاكاة افتراضية وليست آراء حقيقية صادرة عن أشخاص بعينهم.',requirements:['ملخص الفكرة والجمهور المستهدف','افتراضات السوق والمنافسين','مراجعة المخرجات قبل اعتمادها']},
  {id:'marketing',name:'مدير التسويق',subtitle:'خطة إطلاق وتسويق قابلة للمراجعة',description:'إعداد استراتيجية إطلاق، شرائح الجمهور، والقنوات التسويقية.',category:'تسويق',status:'موصوفة',kind:'skill',icon:'↗',detail:'يحوّل أهداف المشروع إلى خطة إطلاق ومراحل تسويق ومؤشرات أداء، مع توضيح الافتراضات التي تحتاج بيانات فعلية.',requirements:['وصف المنتج والسوق','الميزانية والمدة المستهدفة','مراجعة الخطة قبل النشر']},
  {id:'finance',name:'المدير المالي',subtitle:'الإيرادات والتكاليف وهوامش الربح',description:'تحليل نموذج الإيرادات وبناء تقديرات مالية وفق المدخلات.',category:'المالية',status:'موصوفة',kind:'skill',icon:'◫',detail:'يبني سيناريوهات مالية قابلة للتعديل، ويفصل الأرقام المدخلة عن الافتراضات والتقديرات.',requirements:['أسعار البيع والتكاليف','حجم المبيعات المتوقع','إظهار الافتراضات ومراجعة الأرقام']},
  {id:'consumer',name:'اختبار المستهلك',subtitle:'محاكاة 100 سيناريو شراء',description:'تمثيل شرائح عملاء مختلفة وتحليل دوافع الشراء والاعتراضات.',category:'بحث العملاء',status:'موصوفة',kind:'skill',icon:'◎',detail:'محاكاة سيناريوهات شراء لشرائح متنوعة بحسب الدخل والسلوك والاعتراضات. النتائج افتراضية ولا تعادل مقابلات أو طلباً سوقياً مثبتاً.',requirements:['تعريف شرائح العملاء','صياغة عرض القيمة والسعر','تمييز المحاكاة عن بيانات السوق الفعلية']},
  ...Array.from({length:7},(_,i)=>({id:'founder-pending-'+(i+1),name:'مهارة Founder '+(i+5),subtitle:'بانتظار وصف المهارة ومصدرها',description:'لم تصل تفاصيل هذه المهارة ضمن الوصف المتاح.',category:'Founder Skills',status:'بانتظار التفاصيل',kind:'skill' as Kind,icon:'…',detail:'لا توجد مواصفات كافية لعرض وظيفة أو تشغيل هذه المهارة. ستبقى غير مفعلة حتى توفير الوصف والمصدر ومعايير الاختبار.',requirements:['اسم المهارة الرسمي','وصف الوظيفة والمدخلات والمخرجات','مصدر موثوق واختبارات قبول']}))
];

const extensions:Item[] = [
  {id:'heyfield',name:'Open HeyField',subtitle:'إنشاء فيديوهات بالذكاء الاصطناعي',description:'إضافة مرشحة لمسار إنتاج الفيديو.',category:'الفيديو',status:'مرشح للفحص',kind:'extension',icon:'▣',detail:'أداة مرشحة لإنشاء الفيديو. يلزم التحقق من الاسم الرسمي والمستودع والترخيص ومتطلبات التشغيل قبل الربط.',requirements:['رابط المشروع الرسمي','فحص الترخيص والتبعيات','اختبار محلي دون بيانات إنتاج']},
  {id:'voice',name:'Voice Studio',subtitle:'توليد الأصوات محلياً',description:'إضافة مرشحة لتوليد الصوت على الجهاز.',category:'الصوت',status:'مرشح للفحص',kind:'extension',icon:'♫',detail:'مسار لتوليد الأصوات محلياً وفق وصف المالك. يجب التحقق من دعم اللغة العربية والأصوات وموارد الجهاز.',requirements:['تحديد المحرك والإصدار','مراجعة حقوق الأصوات','قياس الذاكرة والأداء']},
  {id:'openseo',name:'Open SEO',subtitle:'تحليل SEO والروابط الخلفية',description:'متابعة ترتيب الموقع وتدقيق الروابط والأداء.',category:'التسويق',status:'مرشح للفحص',kind:'extension',icon:'⌕',detail:'إضافة تحليل SEO مرشحة. يلزم تحديد مصادر بيانات الترتيب والروابط الخلفية وحدود المجانية.',requirements:['مصادر البيانات وواجهات API','مراجعة شروط الاستخدام','تحديد حدود الاستعلام والتكلفة']},
  {id:'appflowy',name:'AppFlowy',subtitle:'مساحة معرفة وملاحظات',description:'تنظيم المعرفة مع إمكانية تشغيل نماذج محلية بحسب الإعداد.',category:'المعرفة',status:'مرشح للفحص',kind:'extension',icon:'▤',detail:'يمكن تقييمه كمساحة معرفة مرتبطة بسير العمل، بعد فحص الاستضافة وتكامل النماذج والصلاحيات.',requirements:['اختيار استضافة محلية أو خادم','تحديد نطاق المزامنة','اختبار الوصول للملفات']},
  {id:'whisper',name:'Open Whisper',subtitle:'تحويل الكلام إلى نص',description:'إدخال صوتي وتحويله إلى نص.',category:'الصوت',status:'مرشح للفحص',kind:'extension',icon:'◖',detail:'إضافة للتعرف على الكلام. يلزم التحقق من المقصود الدقيق بالمنتج ومصدره ودعم العربية.',requirements:['رابط المصدر الرسمي','اختبار العربية واللهجات','سياسة معالجة التسجيلات']},
  {id:'openproject',name:'OpenProject',subtitle:'إدارة المشاريع والمهام',description:'تنظيم المشاريع ومتابعة التنفيذ.',category:'إدارة العمل',status:'مرشح للفحص',kind:'extension',icon:'▦',detail:'مرشح لإدارة المشاريع والمهام وربطها بمسارات العمل بعد تحديد نموذج الصلاحيات.',requirements:['إعداد مساحة تجريبية','تحديد حقول المزامنة','اختبار الصلاحيات']},
  {id:'cotdy',name:'Cotdy',subtitle:'حجز المواعيد والجداول',description:'تنظيم المواعيد وحجوزات العملاء.',category:'الجدولة',status:'الاسم يحتاج تحققاً',kind:'extension',icon:'◷',detail:'الاسم التجاري والمصدر الرسمي يحتاجان تحققاً قبل أي اعتماد أو ربط.',requirements:['تأكيد الاسم والرابط الرسمي','فحص التكامل والتقويم','تحديد بيانات العملاء']},
  {id:'chatwoot',name:'Chatwoot',subtitle:'صندوق وارد موحد للمحادثات',description:'جمع محادثات العملاء في واجهة واحدة.',category:'خدمة العملاء',status:'مرشح للفحص',kind:'extension',icon:'▱',detail:'مرشح لتوحيد المحادثات وخدمة العملاء. يتطلب فحص قنوات الاتصال وتخزين بيانات العملاء.',requirements:['تحديد قنوات الاتصال','مراجعة الخصوصية والاحتفاظ','إعداد بيئة اختبار']},
  {id:'cap',name:'Cap',subtitle:'تسجيل الشاشة ومشاركة الفيديو',description:'توثيق الشروحات ومشاركة التسجيلات.',category:'التسجيل',status:'مرشح للفحص',kind:'extension',icon:'▣',detail:'مرشح لتسجيل الشاشة. يلزم فحص أنظمة التشغيل وسياسات حفظ ومشاركة التسجيلات.',requirements:['تحديد نظام التشغيل','فحص مسار التخزين والمشاركة','اختبار جودة التسجيل']}
];

const nav = [
  {id:'overview',label:'نظرة عامة',icon:LayoutDashboard},
  {id:'skills',label:'مكتبة المهارات',icon:Sparkles},
  {id:'extensions',label:'مركز الإضافات',icon:Blocks},
  {id:'workflow',label:'سير العمل',icon:Workflow},
  {id:'approvals',label:'الموافقات والأمان',icon:ShieldCheck}
] as const;
type Page = typeof nav[number]['id'];

export default function SkillsExtensionsWorkbench(){
  const [page,setPage]=useState<Page>('overview');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<Item|null>(null);
  const [requested,setRequested]=useState<string[]>([]);
  const [steps,setSteps]=useState(['تحليل الفكرة','اختبار شرائح العملاء','تقدير الإيرادات','إعداد خطة التسويق']);
  const [notice,setNotice]=useState('');
  const [category,setCategory]=useState('الكل');
  const currentItems=page==='extensions'?extensions:skills;
  const filtered=useMemo(()=>currentItems.filter(item=>(item.name+' '+item.subtitle+' '+item.category).toLowerCase().includes(query.toLowerCase())&&(category==='الكل'||item.category===category)),[currentItems,query,category]);
  const categories=['الكل',...Array.from(new Set(currentItems.map(item=>item.category)))];
  function requestReview(item:Item){setRequested(v=>v.includes(item.id)?v:[...v,item.id]);setNotice('تم تسجيل طلب المراجعة محلياً في هذه المعاينة. لم يتم إرسال طلب إلى خادم.');}
  function moveStep(index:number,direction:number){const target=index+direction;if(target<0||target>=steps.length)return;setSteps(old=>{const next=[...old];[next[index],next[target]]=[next[target],next[index]];return next;});}
  return <div className="sw-shell" dir="rtl">
    <aside className="sw-sidebar">
      <div className="sw-brand"><span className="sw-brand-mark"><Sparkles size={19}/></span><span>مشكور <small>مركز الإدارة</small></span></div>
      <div className="sw-workspace"><span className="sw-avatar">م</span><span><b>مساحة العمل</b><small>لوحة المالك</small></span><MoreHorizontal size={18}/></div>
      <span className="sw-nav-label">إدارة النظام</span>
      <nav className="sw-nav">{nav.map(({id,label,icon:Icon})=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setSelected(null);setQuery('');setCategory('الكل');}}><Icon size={18}/><span>{label}</span>{id==='approvals'&&<i>2</i>}</button>)}</nav>
      <div className="sw-sidebar-bottom"><div className="sw-secure"><LockKeyhole size={17}/><span><b>وصول محدود</b><small>لا توجد إضافات متصلة</small></span></div><button className="sw-back" onClick={()=>{window.location.search='';}}> <ArrowLeft size={16}/> العودة إلى الاستوديو</button></div>
    </aside>
    <main className="sw-main">
      <header className="sw-topbar"><div><span>مشكور / </span><b>{nav.find(n=>n.id===page)?.label}</b></div><div className="sw-top-actions"><span className="sw-demo"><i/> وضع المعاينة</span><button aria-label="المساعدة"><CircleHelp size={18}/></button><span className="sw-avatar">م</span></div></header>
      <div className="sw-content">
        {page==='overview'&&<section className="sw-page">
          <div className="sw-page-head"><div><span className="sw-eyebrow">WORKSPACE CONTROL</span><h1>مركز العمل الذكي</h1><p>أدر المهارات والإضافات، وابنِ مسارات عمل واضحة وآمنة.</p></div><button className="sw-primary" onClick={()=>setPage('workflow')}><Plus size={17}/> إنشاء سير عمل</button></div>
          <div className="sw-stats"><article><span className="sw-stat-icon violet"><Sparkles size={19}/></span><small>المهارات الموصوفة</small><b>4</b><em>من 11 مهارة في Founder Skill</em></article><article><span className="sw-stat-icon blue"><Blocks size={19}/></span><small>الإضافات المرشحة</small><b>9</b><em>بانتظار فحص المصدر والترخيص</em></article><article><span className="sw-stat-icon green"><Workflow size={19}/></span><small>مسارات العمل</small><b>1</b><em>نموذج أولي قابل للتعديل</em></article><article><span className="sw-stat-icon amber"><ShieldCheck size={19}/></span><small>اتصالات نشطة</small><b>0</b><em>لا توجد خدمات مرتبطة</em></article></div>
          <div className="sw-overview-grid"><section className="sw-panel"><div className="sw-panel-head"><div><h2>ابدأ من هنا</h2><p>اختصارات إلى مساحات الإدارة الأساسية</p></div></div><div className="sw-shortcuts"><button onClick={()=>setPage('skills')}><span className="sw-short-icon violet"><Sparkles/></span><b>استعرض المهارات</b><small>Founder Skills والمهارات المتخصصة</small><ChevronLeft/></button><button onClick={()=>setPage('extensions')}><span className="sw-short-icon blue"><Blocks/></span><b>قيّم الإضافات</b><small>الأدوات المرشحة للربط</small><ChevronLeft/></button><button onClick={()=>setPage('workflow')}><span className="sw-short-icon green"><Workflow/></span><b>صمم سير عمل</b><small>رتب الخطوات والموافقات</small><ChevronLeft/></button></div></section>
          <section className="sw-panel"><div className="sw-panel-head"><div><h2>حالة الجاهزية</h2><p>ملخص ما يحتاج إلى مراجعة قبل التفعيل</p></div><Activity size={18}/></div><div className="sw-readiness"><div><span>توثيق المهارات</span><b>4 / 11</b></div><div className="sw-progress"><i style={{width:'36%'}}/></div><div><span>فحص الإضافات</span><b>0 / 9</b></div><div className="sw-progress"><i style={{width:'0%'}}/></div><p><ShieldCheck size={16}/> لا يتم تشغيل أي إضافة قبل مراجعة المصدر والصلاحيات.</p></div></section></div>
          <div className="sw-callout"><span><Zap size={19}/></span><div><b>القاعدة الأساسية</b><p>المستخدم يطلب النتيجة؛ النظام يختار المهارة والإضافة المناسبة. التفاصيل التقنية تبقى في مكتب الإدارة.</p></div></div>
        </section>}
        {(page==='skills'||page==='extensions')&&<section className="sw-page">
          <div className="sw-page-head"><div><span className="sw-eyebrow">{page==='skills'?'SKILL LIBRARY':'EXTENSION CATALOG'}</span><h1>{page==='skills'?'مكتبة المهارات':'مركز الإضافات'}</h1><p>{page==='skills'?'قدرات متخصصة تساعد النظام على إنجاز المهام.':'أدوات خارجية مرشحة لإضافة قدرات جديدة إلى مساحة العمل.'}</p></div><span className="sw-count">{filtered.length} عنصر</span></div>
          <div className="sw-toolbar"><label className="sw-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث بالاسم أو الوظيفة..."/><kbd>⌘ K</kbd></label><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="تصفية حسب الفئة">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="sw-item-grid">{filtered.map(item=><button className="sw-item-card" key={item.id} onClick={()=>setSelected(item)}><div className="sw-card-top"><span className={'sw-item-symbol '+(item.kind==='skill'?'violet':'blue')}>{item.icon}</span><span className="sw-status">{item.status}</span></div><b>{item.name}</b><small>{item.subtitle}</small><p>{item.description}</p><span className="sw-card-foot">{item.category}<span>التفاصيل <ChevronLeft size={15}/></span></span></button>)}</div>
          {filtered.length===0&&<div className="sw-empty"><Search size={25}/><b>لا توجد نتائج</b><p>جرّب كلمة بحث أخرى أو غيّر التصنيف.</p></div>}
        </section>}
        {page==='workflow'&&<section className="sw-page">
          <div className="sw-page-head"><div><span className="sw-eyebrow">WORKFLOW BUILDER</span><h1>منشئ سير العمل</h1><p>رتب خطوات المهمة وحدد نقاط المراجعة قبل التنفيذ.</p></div><button className="sw-primary" onClick={()=>setNotice('حُفظ هذا النموذج محلياً للمعاينة فقط.')}> <Check size={17}/> حفظ النموذج</button></div>
          <div className="sw-builder-grid"><section className="sw-panel sw-builder"><div className="sw-panel-head"><div><h2>تقييم فكرة مشروع</h2><p>مسودة سير عمل · 4 خطوات</p></div><span className="sw-draft">مسودة</span></div><div className="sw-step-list">{steps.map((step,i)=><article className="sw-step" key={step}><span className="sw-step-num">{i+1}</span><div><b>{step}</b><small>{['Founder Skill · مجلس الإدارة','Founder Skill · المستهلك','Founder Skill · المدير المالي','Founder Skill · مدير التسويق'][['تحليل الفكرة','اختبار شرائح العملاء','تقدير الإيرادات','إعداد خطة التسويق'].indexOf(step)]||'خطوة قابلة للتخصيص'}</small></div><span className="sw-step-actions"><button onClick={()=>moveStep(i,-1)} aria-label="تحريك لأعلى"><ArrowUp size={15}/></button><button onClick={()=>moveStep(i,1)} aria-label="تحريك لأسفل"><ArrowDown size={15}/></button></span></article>)}</div><button className="sw-add-step" onClick={()=>setSteps(v=>[...v,'خطوة جديدة'])}><Plus size={16}/> إضافة خطوة</button></section><aside className="sw-panel sw-builder-side"><h2>إعدادات التنفيذ</h2><p>هذه الإعدادات تصور مبدئي ولا تشغل أي أداة فعلية.</p><label>نقطة الموافقة<select defaultValue="before"><option value="before">قبل مشاركة البيانات الخارجية</option><option value="each">قبل كل خطوة</option></select></label><label>حد المخاطر<select defaultValue="medium"><option value="low">منخفض</option><option value="medium">متوسط</option><option value="high">مرتفع</option></select></label><div className="sw-approval-note"><ShieldCheck size={18}/><span>تحتاج مشاركة البيانات أو تنفيذ إجراءات خارجية إلى موافقة صريحة.</span></div></aside></div>
        </section>}
        {page==='approvals'&&<section className="sw-page"><div className="sw-page-head"><div><span className="sw-eyebrow">SECURITY & GOVERNANCE</span><h1>الموافقات والأمان</h1><p>مراجعة الصلاحيات والطلبات قبل السماح بالوصول.</p></div></div><div className="sw-panel sw-security"><div className="sw-security-row"><span className="sw-stat-icon green"><LockKeyhole/></span><div><b>لا توجد إضافات متصلة</b><small>لم يتم منح أي خدمة وصولاً إلى مساحة العمل.</small></div><span className="sw-status">آمن مبدئياً</span></div><div className="sw-security-row"><span className="sw-stat-icon amber"><Clock3/></span><div><b>طلبات المراجعة المحلية</b><small>{requested.length} طلبات في جلسة المعاينة الحالية.</small></div><span className="sw-status">{requested.length?'بانتظار المراجعة':'لا توجد طلبات'}</span></div><div className="sw-approval-note"><ShieldCheck size={18}/><span>لا تحفظ مفاتيح الاتصال في الواجهة. استخدم أقل صلاحية ممكنة وسجل عمليات قابل للتدقيق.</span></div></div></section>}
        {notice&&<div className="sw-toast" role="status">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
      </div>
    </main>
    {selected&&<div className="sw-detail-backdrop" onClick={()=>setSelected(null)}><aside className="sw-detail" onClick={e=>e.stopPropagation()}><header><span className="sw-eyebrow">{selected.kind==='skill'?'SKILL DETAILS':'EXTENSION DETAILS'}</span><button onClick={()=>setSelected(null)} aria-label="إغلاق"><X size={19}/></button></header><div className="sw-detail-icon">{selected.icon}</div><h2>{selected.name}</h2><p className="sw-detail-sub">{selected.subtitle}</p><span className="sw-status">{selected.status}</span><div className="sw-detail-section"><h3>عنصر العمل</h3><p>{selected.detail}</p></div><div className="sw-detail-section"><h3>متطلبات المراجعة</h3>{selected.requirements.map(req=><div className="sw-requirement" key={req}><Check size={15}/>{req}</div>)}</div><div className="sw-detail-warning"><LockKeyhole size={17}/><span>العنصر غير متصل وغير قابل للتشغيل من هذه الشاشة.</span></div><button className="sw-primary sw-full" onClick={()=>requestReview(selected)}>{requested.includes(selected.id)?'تم تسجيل طلب المراجعة':'طلب مراجعة واعتماد'}</button></aside></div>}
  </div>;
}

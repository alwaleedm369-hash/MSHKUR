import { useEffect, useState } from 'react';
import { Blocks, Workflow, RefreshCw, Clock3, CheckCircle2, XCircle, LoaderCircle, ShieldCheck, GitBranch, BookOpen } from 'lucide-react';

async function api<T=any>(url:string):Promise<T>{
  const response=await fetch(url,{headers:{'Content-Type':'application/json'}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.message||body.error||'تعذر تحميل البيانات');
  return body as T;
}

export function SkillsPanel(){
  const [skills,setSkills]=useState<any[]>([]);
  const [workflows,setWorkflows]=useState<any[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  async function load(){
    setLoading(true);setError('');
    try{const [a,b]=await Promise.all([api<{skills:any[]}>('/api/skills'),api<{workflows:any[]}>('/api/workflows')]);setSkills(a.skills);setWorkflows(b.workflows);}
    catch(e){setError(e instanceof Error?e.message:'تعذر تحميل المكتبة');}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  return <section className="ops-panel" dir="rtl">
    <div className="ops-heading"><div><span>مكتبة التنفيذ</span><h2>المهارات وسير العمل</h2><small>كل مهارة لها مدخلات وصلاحيات ومخرج محدد</small></div><button onClick={load}><RefreshCw size={16}/> تحديث</button></div>
    {error&&<p className="ops-error">{error}</p>}
    {loading?<p className="ops-note">جارٍ تحميل المهارات...</p>:<>
      <div className="work-library-grid">{skills.map(skill=><article className="work-library-card" key={skill.id}>
        <div className="work-library-icon"><Blocks size={19}/></div><div className="work-library-title"><b>{skill.name}</b><span>{skill.category||'عام'} · v{skill.version||'1.0.0'}</span></div>
        <p>{skill.description}</p><div className="work-library-meta"><span>{skill.runtime==='browser'?'داخل المتصفح':'على الخادم'}</span><span>{skill.cost==='local'?'محلي':'يتطلب إعداداً'}</span></div><code>{skill.id}</code>
      </article>)}</div>
      <div className="work-library-section"><div className="ops-heading"><div><span>وصفات قابلة للتنفيذ</span><h2>سير العمل</h2></div><Workflow size={20}/></div>
        {workflows.map(flow=><article className="workflow-row" key={flow.id}><div><b>{flow.name}</b><p>{flow.description}</p><small>{(flow.steps||[]).length} خطوات · {flow.externalSideEffects?'يتطلب موافقة خارجية':'تنفيذ محلي'}</small></div><span><CheckCircle2 size={16}/> {flow.id}</span></article>)}
      </div>
      <div className="import-roadmap"><div><GitBranch size={19}/><b>استيراد مهارة من GitHub أو ملف SKILL.md</b></div><p>مسار الاستيراد التالي سيقبل ملفات المهارات والتوثيق فقط، ويفحص المصدر والترخيص والصلاحيات قبل إضافتها. لن يشغّل كوداً مستورداً تلقائياً أو يمنحه صلاحية الوصول إلى بيانات المعرض.</p><a href="https://github.com/alwaleedm369-hash/MSHKUR/tree/build/phase-02-engine-core/skills" target="_blank" rel="noreferrer">مجلد المهارات الحالي <BookOpen size={14}/></a></div>
    </>}
  </section>;
}

export function TasksPanel(){
  const [tasks,setTasks]=useState<any[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  async function load(){setLoading(true);setError('');try{const data=await api<{tasks:any[]}>('/api/tasks');setTasks(data.tasks||[]);}catch(e){setError(e instanceof Error?e.message:'تعذر تحميل سجل المهام');}finally{setLoading(false);}}
  useEffect(()=>{load();const timer=window.setInterval(()=>{api<{tasks:any[]}>('/api/tasks').then(data=>setTasks(data.tasks||[])).catch(()=>{});},5000);return()=>window.clearInterval(timer);},[]);
  return <section className="ops-panel" dir="rtl">
    <div className="ops-heading"><div><span>Maestro</span><h2>مهام العمل</h2><small>سجل التنفيذ ونتائج المهارات في مساحة العمل الحالية</small></div><button onClick={load}><RefreshCw size={16}/> تحديث</button></div>
    {error&&<p className="ops-error">{error}</p>}
    {loading?<p className="ops-note">جارٍ تحميل المهام...</p>:tasks.length===0?<div className="work-empty"><Clock3 size={26}/><b>لا توجد مهام بعد</b><p>عند تنفيذ أداة أو سير عمل ستظهر حالته ونتيجته هنا.</p></div>:<div className="task-history">{tasks.map(task=><article className="task-history-row" key={task.id}>
      <div className="task-history-icon">{task.status==='succeeded'?<CheckCircle2 size={18}/>:task.status==='failed'?<XCircle size={18}/>:<LoaderCircle className="spin" size={18}/>}</div>
      <div className="task-history-main"><b>{task.skill_id||task.skillId||'مهمة'}</b><small>{task.created_at?new Date(task.created_at).toLocaleString('ar-SA'):'وقت غير متاح'}</small>{task.error_message&&<p>{task.error_message}</p>}</div>
      <span className={'task-status status-'+task.status}>{({succeeded:'مكتملة',failed:'فشلت',running:'قيد التنفيذ',queued:'في الانتظار'})[task.status as string]||task.status}</span>
    </article>)}</div>}
    <div className="work-safety-note"><ShieldCheck size={17}/><span>المهام مقيدة بمهارات مسموحة وعزل مساحة العمل. أي نشر أو إرسال خارجي يحتاج موافقة مستقلة.</span></div>
  </section>;
}

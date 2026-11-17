import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Blocks, Workflow, RefreshCw, Clock3, CheckCircle2, XCircle, LoaderCircle, ShieldCheck, GitBranch, BookOpen } from 'lucide-react';

async function api<T=any>(url:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.message||body.error||'تعذر تحميل البيانات');
  return body as T;
}

export function SkillsPanel(){
  const [skills,setSkills]=useState<any[]>([]);
  const [workflows,setWorkflows]=useState<any[]>([]);
  const [vehicles,setVehicles]=useState<any[]>([]);
  const [workflowVehicle,setWorkflowVehicle]=useState('');
  const [runningWorkflow,setRunningWorkflow]=useState('');
  const [workflowResult,setWorkflowResult]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [imports,setImports]=useState<any[]>([]);
  const [sourceUrl,setSourceUrl]=useState('');
  const [importBusy,setImportBusy]=useState(false);
  const [importMessage,setImportMessage]=useState('');
  async function load(){
    setLoading(true);setError('');
    try{const [a,b,c,d]=await Promise.all([api<{skills:any[]}>('/api/skills'),api<{workflows:any[]}>('/api/workflows'),api<{imports:any[]}>('/api/imported-skills'),api<{vehicles:any[]}>('/api/vehicles')]);setSkills(a.skills);setWorkflows(b.workflows);setImports(c.imports);setVehicles(d.vehicles);if(!workflowVehicle&&d.vehicles[0])setWorkflowVehicle(d.vehicles[0].id);}
    catch(e){setError(e instanceof Error?e.message:'تعذر تحميل المكتبة');}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  async function importFromGithub(e:FormEvent){
    e.preventDefault();setImportBusy(true);setImportMessage('جارٍ جلب الملف والتحقق من الترخيص...');
    try{await api<{imported:any}>('/api/imported-skills/github',{method:'POST',body:JSON.stringify({url:sourceUrl})});setImportMessage('تم استيراد وصف المهارة إلى قائمة المراجعة. لم يتم تشغيلها.');setSourceUrl('');await load();}
    catch(error){setImportMessage(error instanceof Error?error.message:'تعذر استيراد المصدر');}
    finally{setImportBusy(false);}
  }
  async function runWorkflow(id:string){
    if(!workflowVehicle){setWorkflowResult('أضف سيارة أولاً لتنفيذ هذا المسار.');return;}
    setRunningWorkflow(id);setWorkflowResult('جارٍ تنفيذ الخطوات...');
    try{const result=await api<{workflow:any}>('/api/workflows/'+id+'/run',{method:'POST',body:JSON.stringify({vehicleId:workflowVehicle})});setWorkflowResult(result.workflow.status==='succeeded'?'اكتمل سير العمل وحُفظت نتائجه.':'انتهى التنفيذ مع تعثر إحدى الخطوات. افتح سجل المهام للمراجعة.');}
    catch(error){setWorkflowResult(error instanceof Error?error.message:'تعذر تنفيذ سير العمل');}
    finally{setRunningWorkflow('');}
  }
  async function reviewImport(id:string,status:'approved'|'rejected'){
    try{await api('/api/imported-skills/'+id+'/review',{method:'POST',body:JSON.stringify({status,note:status==='approved'?'مراجعة أولية للوثيقة فقط؛ يلزم محول تنفيذ مستقل قبل التفعيل.':'مرفوض من المالك'})});await load();}
    catch(error){setImportMessage(error instanceof Error?error.message:'تعذر حفظ المراجعة');}
  }
  return <section className="ops-panel" dir="rtl">
    <div className="ops-heading"><div><span>مكتبة التنفيذ</span><h2>المهارات وسير العمل</h2><small>كل مهارة لها مدخلات وصلاحيات ومخرج محدد</small></div><button onClick={load}><RefreshCw size={16}/> تحديث</button></div>
    {error&&<p className="ops-error">{error}</p>}
    {loading?<p className="ops-note">جارٍ تحميل المهارات...</p>:<>
      <div className="work-library-grid">{skills.map(skill=><article className="work-library-card" key={skill.id}>
        <div className="work-library-icon"><Blocks size={19}/></div><div className="work-library-title"><b>{skill.name}</b><span>{skill.category||'عام'} · v{skill.version||'1.0.0'}</span></div>
        <p>{skill.description}</p><div className="work-library-meta"><span>{skill.runtime==='browser'?'داخل المتصفح':'على الخادم'}</span><span>{skill.cost==='local'?'محلي':'يتطلب إعداداً'}</span></div><code>{skill.id}</code>
      </article>)}</div>
      <div className="work-library-section"><div className="ops-heading"><div><span>وصفات قابلة للتنفيذ</span><h2>سير العمل</h2></div><Workflow size={20}/></div>
        {workflows.map(flow=><article className="workflow-row" key={flow.id}><div><b>{flow.name}</b><p>{flow.description}</p><small>{(flow.steps||[]).length} خطوات · {flow.externalSideEffects?'يتطلب موافقة خارجية':'تنفيذ محلي'}</small></div><span><CheckCircle2 size={16}/> {flow.id}</span><div className="workflow-run-controls"><select aria-label="اختر السيارة" value={workflowVehicle} onChange={e=>setWorkflowVehicle(e.target.value)}><option value="">اختر سيارة</option>{vehicles.map(vehicle=><option key={vehicle.id} value={vehicle.id}>{[vehicle.year,vehicle.make,vehicle.model].filter(Boolean).join(' ')}</option>)}</select><button type="button" disabled={!!runningWorkflow||!vehicles.length} onClick={()=>runWorkflow(flow.id)}>{runningWorkflow===flow.id?<LoaderCircle size={14} className="spin"/>:'تنفيذ'}</button></div></article>)}
        {workflowResult&&<p className="import-feedback">{workflowResult}</p>}
      </div>
      <div className="import-roadmap"><div><GitBranch size={19}/><b>استيراد مهارة من GitHub</b></div>
        <p>ألصق رابط ملف SKILL.md من مستودع عام. نفحص وجود ترخيص واضح ونثبت commit المصدر. نستورد الوثيقة فقط إلى مساحة مراجعة خاصة بحسابك؛ لا نشغّل كوداً ولا ننزّل نماذج تلقائياً.</p>
        <form className="skill-import-form" onSubmit={importFromGithub}>
          <input type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://github.com/owner/repo/blob/main/skills/example/SKILL.md" required dir="ltr"/>
          <button type="submit" disabled={importBusy}>{importBusy?<LoaderCircle size={15} className="spin"/>:<GitBranch size={15}/>} استيراد للمراجعة</button>
        </form>
        {importMessage&&<p className="import-feedback">{importMessage}</p>}
        <a href="https://github.com/alwaleedm369-hash/MSHKUR/tree/build/phase-02-engine-core/skills" target="_blank" rel="noreferrer">مجلد مهارات MSHKUR <BookOpen size={14}/></a>
        <div className="imported-source-list"><b>المصادر المستوردة</b>
          {imports.length===0?<small>لا توجد مصادر مستوردة بعد.</small>:imports.map(item=><article className="imported-source-row" key={item.id}>
            <div><b>{item.skill_name}</b><small>{item.repository} · {item.license_spdx} · {item.commit_sha?.slice(0,8)}</small><span>{item.status==='review_required'?'بانتظار المراجعة':item.status==='approved'?'مقبول للمراجعة الفنية':'مرفوض'}</span></div>
            {item.status==='review_required'&&<div className="import-review-actions"><button type="button" onClick={()=>reviewImport(item.id,'approved')}>اعتماد الوثيقة</button><button type="button" onClick={()=>reviewImport(item.id,'rejected')}>رفض</button></div>}
          </article>)}
        </div>
        <small className="import-warning">اعتماد الوثيقة لا يفعّل المهارة. تفعيل أي مهارة يتطلب كتابة محول آمن واختبارات وصلاحيات منفصلة.</small>
      </div>
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
      <span className={'task-status status-'+task.status}>{(({succeeded:'مكتملة',failed:'فشلت',running:'قيد التنفيذ',queued:'في الانتظار'} as Record<string,string>)[task.status]||task.status)}</span>
    </article>)}</div>}
    <div className="work-safety-note"><ShieldCheck size={17}/><span>المهام مقيدة بمهارات مسموحة وعزل مساحة العمل. أي نشر أو إرسال خارجي يحتاج موافقة مستقلة.</span></div>
  </section>;
}

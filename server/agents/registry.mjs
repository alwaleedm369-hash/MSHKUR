export const agentRegistry = [
  { id:'maestro', name:'مدير مشكور', title:'المنسق العام', description:'يفهم الطلب ويقسمه إلى خطوات ويختار المهارات المسموحة ويتابع النتيجة.', skills:['vehicle-ad-copy','vehicle-validate','image-optimize','license-plate-blur-region'], mode:'orchestrator' },
  { id:'vehicle-specialist', name:'مختص السيارات', title:'سجل السيارة والإعلان', description:'يتحقق من بيانات السيارة ويجهز مسودات الإعلانات دون اختراع مواصفات.', skills:['vehicle-ad-copy','vehicle-validate'], mode:'deterministic' },
  { id:'photo-specialist', name:'مختص الصور', title:'معالجة الصور محلياً', description:'يحسن الصور ويحولها ويطمس منطقة يحددها المستخدم.', skills:['image-optimize','license-plate-blur-region'], mode:'deterministic' },
  { id:'operations-specialist', name:'مساعد العمليات', title:'المهام والموافقات', description:'يتابع المهام وسجل التدقيق ويجهز الإجراءات الخارجية للمراجعة.', skills:[], mode:'policy' },
];
export function listAgents(){ return agentRegistry; }

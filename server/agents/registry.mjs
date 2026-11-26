export const agentRegistry = [
  { id:'maestro', name:'مدير مشكور', title:'المنسق العام', description:'يفهم الطلب ويقسمه إلى خطوات ويختار المهارات المسموحة ويتابع النتيجة.', skills:['vehicle-ad-copy','vehicle-validate','image-optimize','background-remove','license-plate-blur-region'], mode:'orchestrator' },
  { id:'vehicle-specialist', name:'مختص السيارات', title:'سجل السيارة والإعلان', description:'يتحقق من بيانات السيارة ويجهز مسودات الإعلانات دون اختراع مواصفات.', skills:['vehicle-ad-copy','vehicle-validate'], mode:'deterministic' },
  { id:'photo-specialist', name:'مختص الصور', title:'معالجة الصور محلياً', description:'يحسن الصور ويحولها ويطمس منطقة يحددها المستخدم.', skills:['image-optimize','background-remove','license-plate-blur-region'], mode:'deterministic' },
  { id:'map-growth-specialist', name:'مساعد نمو المعارض', title:'اكتشاف العملاء عبر الخرائط', description:'يجهز عمليات بحث محلية للمعارض ومراكز العناية بالسيارات، ويترك مراجعة النتائج والتواصل للمالك.', skills:['map-prospect-search'], mode:'human-approved' },
  { id:'customer-success-specialist', name:'مساعد استقبال العملاء', title:'الاستفسارات والمحادثات', description:'يرد على الأسئلة العامة من معلومات المعرض المعتمدة، ويسجل المحادثة ويحيل الحالات التي تحتاج موظفاً.', skills:['website-customer-chat'], mode:'guarded-local' },
  { id:'operations-specialist', name:'مساعد العمليات', title:'المهام والموافقات', description:'يتابع المهام وسجل التدقيق ويجهز الإجراءات الخارجية للمراجعة.', skills:[], mode:'policy' },
];
export function listAgents(){ return agentRegistry; }

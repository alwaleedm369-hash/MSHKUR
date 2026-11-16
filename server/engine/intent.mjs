const rules = [
  { skillId:'image-optimize', patterns:[/ضغط.*(صورة|صور)/u,/حس[ّن].*(صورة|صور)/u,/حوّل.*webp/iu,/قلل.*حجم.*(صورة|صور)/u] },
  { skillId:'background-remove', patterns:[/إزالة.*الخلفية/u,/أزل.*الخلفية/u,/احذف.*الخلفية/u,/خلفية.*شفافة/u] },
  { skillId:'license-plate-blur-region', patterns:[/طمس.*(لوحة|اللوحة|رقم)/u,/اخف.*(لوحة|اللوحة|رقم)/u] },
  { skillId:'vehicle-ad-copy', patterns:[/اكتب.*(إعلان|اعلان)/u,/جهز.*(إعلان|اعلان)/u,/وصف.*سيارة/u,/سو[ّ]ق.*سيارة/u] },
  { skillId:'vehicle-validate', patterns:[/راجع.*بيانات.*سيارة/u,/تحقق.*(مواصفات|بيانات).*سيارة/u,/الحقول.*الناقصة/u] },
];
export function classifyIntent(text){
  if(typeof text!=='string'||!text.trim()) return {matched:false,confidence:0,reason:'empty_request'};
  const normalized=text.trim().toLowerCase();
  for(const rule of rules) if(rule.patterns.some(pattern=>pattern.test(normalized))) return {matched:true,skillId:rule.skillId,confidence:0.86,reason:'deterministic_keyword_match',requiresInput:true};
  return {matched:false,confidence:0,reason:'no_local_skill_match',message:'لم أجد مهارة محلية مناسبة لهذا الطلب بعد. يمكن إضافة مهارة معتمدة بدلاً من تنفيذ إجراء غير معروف.'};
}

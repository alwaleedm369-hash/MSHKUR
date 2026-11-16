# خادم MCP المحلي لمشكور

يستخدم مشكور حزمة MCP TypeScript Server v2، ويعرض أدوات محدودة عبر stdio فقط. لا يفتح منفذاً عاماً ولا يسمح بالوصول إلى أكثر من مساحة معرض واحدة لكل عملية.

## الأدوات المتاحة

- `mshkur_status`: حالة الخدمة.
- `mshkur_list_skills`: قائمة المهارات وبيئة تشغيلها.
- `mshkur_list_agents`: الموظفون المتخصصون.
- `mshkur_list_vehicles`: سيارات المعرض المحدد.
- `mshkur_list_tasks` و`mshkur_get_task`: سجل المهام.
- `mshkur_run_skill`: تشغيل مهارة خادم مسموحة فقط.
- `mshkur_list_approvals` و`mshkur_create_approval`: الموافقات. إنشاء الموافقة لا ينفذ الإجراء الخارجي.

لا يوجد tool للـ shell أو تنفيذ SQL حر أو تصفح الملفات أو إرسال WhatsApp أو النشر أو الشراء. مهارة إزالة الخلفية تعمل في المتصفح ولا يمكن استدعاؤها من MCP الخادمي.

## التشغيل المحلي

1. ثبّت Node.js وdependencies من جذر المشروع.
2. أنشئ مستخدماً ومساحة معرض عبر واجهة مشكور.
3. شغّل `npm run mcp:identities` لعرض معرّفات المستخدمين والمعارض المحليين.
4. ضع القيم في بيئة عملية MCP فقط:
   - `MSHKUR_MCP_TENANT_ID`
   - `MSHKUR_MCP_USER_ID`
5. شغّل `npm run mcp:stdio`.

يجب أن يكون المستخدم المحدد owner أو admin في المعرض. لا تضع هذه المتغيرات في الواجهة أو ملفات عامة. لا تشارك إعداد MCP مع مستخدم غير موثوق.

## مثال إعداد عميل MCP

استخدم إعداداً محلياً خاصاً بعميلك، ولا ترفع ملف إعداد يحوي بيانات البيئة إلى Git:

```json
{
  "mcpServers": {
    "mshkur": {
      "command": "node",
      "args": ["/absolute/path/to/MSHKUR/server/mcp/index.mjs"],
      "env": {
        "MSHKUR_DB_PATH": "/absolute/path/to/MSHKUR/data/mshkur.sqlite",
        "MSHKUR_STORAGE_DIR": "/absolute/path/to/MSHKUR/storage",
        "MSHKUR_MCP_TENANT_ID": "YOUR_TENANT_ID",
        "MSHKUR_MCP_USER_ID": "YOUR_OWNER_USER_ID"
      }
    }
  }
}
```

استبدل المسارات والمعرّفات محلياً. لا تضع مفاتيح أو كلمات مرور في إعداد MCP.

## REA

يمكن إضافة هذا الخادم إلى عميل MCP نفسه الذي يشغّل REA. بذلك يستطيع وكيل التطوير قراءة مهارات مشكور وتشغيل مهارات خادمية مسموحة على معرض اختباري. لا تربط REA ببيانات عملاء حقيقية أثناء reverse engineering، واستخدم حساب اختبار محدوداً.

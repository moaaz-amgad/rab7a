# توثيق تقنيات وهيكل الواجهة الأمامية (Frontend Architecture & Technologies)
## مشروع نظام ربحة لإدارة المطاعم — Rabha ERP

هذا الملف يحتوي على شرح تفصيلي شامل لكل ما تم استخدامه وبناؤه في جانب الواجهة الأمامية (Frontend) للنظام، مقسماً حسب محاور الويب الأساسية: **HTML**، **CSS والتصميم**، و **JavaScript / TypeScript والمنظومة البرمجية**.

---

## 1. هيكل الـ HTML والعناصر الأساسية (Structure)

الملف الرئيسي هو [`frontend/index.html`](frontend/index.html):

1. **إعدادات الاتجاه واللغة (RTL & Arabic Locale):**
   * استخدام `<html lang="ar" dir="rtl">` لدعم الاتجاه من اليمين لليسار أصلياً في المتصفح.
   * تحديد أبعاد الشاشة المناسبة للموبايل: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
2. **عنصر الجذر المتصاعد (Single Page Application Root):**
   * وجود `<div id="root"></div>` وهو العنصر الوحيد الذي تحقن فيه مكتبة React شجرة التطبيق بالكامل داخل الـ DOM.
3. **استدعاء الخطوط العربية واللاتينية (Google Fonts):**
   * خط **Cairo** (أوزان 300 حتى 900) لمنح واجهة المستخدم مظهراً عربياً احترافياً وواضحاً للأرقام والأسماء.
   * خط **Inter** للنصوص والرموز الفرعية.
4. **نقطة انطلاق السكربت:**
   * `<script type="module" src="/src/main.tsx"></script>` لتحميل تطبيق React بصيغة ES Modules عبر Vite.

---

## 2. التنسيق والتصميم (CSS & Styling)

تم الاعتماد على خليط متناغم بين **Tailwind CSS** و **Ant Design Theme** و **Vanilla CSS**:

### أ. إطار العمل Tailwind CSS (مع PostCSS & Autoprefixer)
* **المسؤولية:** إعطاء مرونة فائقة وتنسيقات سريعة (Utility-first CSS) وتجاوب كامل (Responsive Design).
* **إعدادات الخط في `tailwind.config.js`:** تم توسيع الخطوط لتصبح `font-cairo` هي الخط الأساسي.
* **كلاسات الموبايل والشبكة:** استخدام كلاسات التجاوب مثل `hidden md:block`، `p-4 md:p-6`، `grid-cols-1 md:grid-cols-3`.

### ب. التنسيقات المخصصة في `frontend/src/index.css`
* **تخصيص شريط التمرير (Custom Scrollbar):** تصميم Scrollbar أنيق ورفيع بحجم `6px` ودرجات ألوان Slate تتوافق مع هوية لوحات التحكم الحديثة.
* **تنسيق هوية الكروت والأزرار (Ant Design Overrides):**
  * ضبط حواف البطاقات `border-radius: 12px` والظلال `box-shadow` الخفيفة لتمنح شعوراً بالعمق والفخامة.
  * ضبط حواف الأزرار على `border-radius: 8px`.
* **تجهيز وضعية الطباعة الاحترافية (`@media print`):**
  * كود CSS مخصص لطباعة **قسائم الرواتب (Payslips) والفواتير**:
  * إخفاء القوائم، والأزرار، والهيدر، والفوتر عند الضغط على أمر الطباعة `window.print()`.
  * إظهار فقط حاوية القسيمة `#printable-payslip-document` مع دعم خيار `-webkit-print-color-adjust: exact` ليطبع المتصفح الخلفيات والألوان الرسمية بدقة متناهية.
* **تعديلات شاشات الموبايل والتابلت (`@media (max-width: 767px)`):**
  * جعل الجداول الكبيرة تسحب أفقياً بسلاسة (`overflow-x: auto` مع `-webkit-overflow-scrolling: touch`).
  * تكييف النوافذ المنبثقة (Modals) وكروت الإحصائيات (Statistics) لتناسب الشاشات الصغيرة.

---

## 3. المنطق البرمجي، الجافاسكربت ومكتبة ريأكت (JS / TypeScript & Architecture)

تم استخدام **TypeScript** (النسخة الحديثة ذات النمط الصارم من JavaScript) لضمان كتابة كود خالي من أخطاء البيانات (Type Safety):

### أ. بيئة العمل وأداة البناء (Vite & TypeScript)
* **Vite (`vite.config.ts`):** أداة بناء وتطوير فائقة السرعة؛ تمنح تشغيلاً محلياً فورياً (HMR - Hot Module Replacement) مع توجيه الطلبات الخلفية عبر البروكسي (`/api` -> `http://127.0.0.1:8000`).
* **Path Aliases (`@/*`):** ضبط المسارات المختصرة لتسهيل استيراد الملفات من مجلد `src` مباشرة.

### ب. مكتبة واجهة المستخدم Ant Design (AntD v5)
* **مكونات العرض والتنقل:** `Layout`، `Sider`، `Header`، `Menu`، `Drawer` (لقائمة الموبايل الجانبية).
* **إدارة الحقول والنماذج:** `Form`، `Input`، `InputNumber`، `Select`، `DatePicker`، `Modal` مع قواعد التحقق (Validation Rules).
* **توطين واجهة المستخدم (RTL Localization):** استخدام `<ConfigProvider direction="rtl" locale={arEG}>` في `App.tsx` لتحويل كل عناصر Ant Design (التقاويم، أزرار الإلغاء/التأكيد، الجداول) للغة العربية والاتجاه الأيمن.
* **حزمة الأيقونات:** `@ant-design/icons` و `lucide-react` لأيقونات لوحة التحكم، المالية، المخازن والموظفين.

### ج. معمارية إدارة الحالة والبيانات (State Management)
* **React Context API (`HrContext.tsx`):**
  * بناء مخزن بيانات مركزي موحد يحتوي على: قائمة الموظفين (`employees`)، دفتر الأستاذ المالي للرواتب والخصومات (`ledgerStore`)، سجلات صرف المسيرات (`payoutsStore`)، وحالات المسير الشهري (`payrollStatusStore`).
* **استراتيجية التخزين المزدوج والمزامنة (Offline/Online Synchronization):**
  1. تخزين محلي على المتصفح عبر `localStorage` (لضمان السرعة والاحتفاظ بالبيانات حتى لو انقطع الاتصال).
  2. مزامنة لحظية مع سيرفر الباك إند عبر الـ API (`/api/v1/hr/sync-state`) لدعم فتح لوحة التحكم من أجهزة متعددة وعبر شبكة ngrok.
  3. استخدام الـ Debounce الزمني (`setTimeout` لمدة 500ms) لمنع إرسال طلبات زائدة عند تكرار العمليات.

### د. المعالجات والعمليات الحسابية المدمجة في الفرونت
1. **معالجة مبالغ الرواتب بالقرش (`piasters`):**
   * تجنب مشاكل الكسور العشرية العائمة في الجافاسكربت (Floating-point precision issues) بحفظ المبالغ بصيغة القرش وتحويلها للعرض بالجنيه عبر دوال التنسيق.
   * دالة `formatMoney()`: تحويل الرقم إلى صيغة العملة المصرية المعتمدة مع الرمز `ج.م` باستخدام كائن المتصفح القياسي `Intl.NumberFormat('ar-EG', ...)`.
2. **احتساب الراتب النسبي (Prorated Base Salary):**
   * خوارزمية ذكية لاحتساب راتب الموظف في شهر تعيينه بناءً على تاريخ التحاقه بالمطعم (على أساس الشهر القياسي 30 يوماً).
3. **دفتر الحسابات وقيود العمليات (Running Balance Ledger):**
   * عند إضافة أي عملية (سلفة، خصم، تأخير، غياب، مكافأة، أوفرتايم)، يتم احتساب الرصيد التراكمي وتوليد رقم قيد وحركة فريد (`TXN-...`).
4. **دورة صرف الرواتب (Payroll Cycle):**
   * دعم دورة حياة المسير: مسودة (`draft`) ← محسوب (`calculated`) ← معتمد (`approved`) ← منصرف (`paid`)، مع إمكانية الصرف الجماعي للمطعم أو الفردي لكل موظف.

### هـ. المكونات المشتركة وصفحات النظام (Pages & Components)
* **الهيكل العام (`EmployeePayrollModuleContainer.tsx`):**
  * التنقل التفاعلي بين الشاشات بدون إعادة تحميل الصفحة (SPA View Switcher).
  * هيدر متجاوب يغير طريقة العرض بين شاشات الكمبيوتر (Sidebar ثابت قابل للطي) وشاشات الموبايل (Drawer منزلق).
* **شاشات شؤون الموظفين والرواتب:**
  * `EmployeeListPage.tsx`: استعراض الموظفين، البحث، الفرز، وإضافة موظف جديد.
  * `EmployeeProfilePage.tsx`: الملف التعريفي التفصيلي وإجراء العمليات المالية المباشرة.
  * `EmployeeStatementPage.tsx`: كشف الحساب المالي التفصيلي وتصديره.
  * `PayrollDashboardWidget.tsx` & `PayrollListPage.tsx`: مؤشرات كتلة الأجور وجداول المسير وقسائم الرواتب.
* **شاشات سلاسل الإمداد والمخزون:**
  * `InventoryListPage.tsx`: حصر الخامات ومتوسط التكلفة WAC.
  * `StockMovementsPage.tsx`: حركات التوريد، الصرف، والهالك.
  * `PurchaseOrderListPage.tsx`: أوامر الشراء ودورة الاستلام (GRN).
  * `SupplierListPage.tsx` & `SupplierStatementPage.tsx`: حسابات الموردين والأرصدة المستحقة وحركات السداد.

---

### ملخص الحزمة التقنية (Tech Stack):
* **الهيكل:** HTML5 الدلالي (Semantic HTML) مجهز كلياً بالـ RTL والخطوط العربية.
* **التصميم والتنسيق:** Tailwind CSS 3 + تخصيصات Vanilla CSS + هوية وثيم Ant Design 5.
* **المحرك ولغة البرمجة:** React 18 + TypeScript + Vite 5.
* **إدارة الحالة والشبكة:** React Context + Hooks (`useState`, `useEffect`, `useContext`) + Fetch API + LocalStorage.

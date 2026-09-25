# نظام ربحة لإدارة المطاعم — Rabha ERP System

> **Enterprise Restaurant Resource Planning & Management System**  
> نظام تخطيط وإدارة موارد المؤسسات المخصص لقطاع المطاعم وإدارة الفروع، الموارد البشرية، الرواتب، سلاسل الإمداد والمخزون، المشتريات والحسابات.

---

## 🌟 نظرة عامة (Overview)

**Rabha ERP** هو نظام متكامل ومصمم خصيصاً لإدارة عمليات المطاعم وسلاسل الإمداد، تم بناؤه وفق أعلى معايير هندسة البرمجيات لتلبية الاحتياجات التشغيلية والمالية:
- **الموارد البشرية والرواتب (HR & Payroll)**: كشوف حسابات الموظفين، السلف، المكافآت، الخصومات، ومسيرات الرواتب الدقيقة.
- **سلاسل الإمداد وإدارة المخزون (Supply Chain & Inventory)**: حصر الأصناف وخامات التصنيع، حركات المخزن، تسوية الهالك، وأوامر الشراء وإذن الاستلام الفعلي (GRN).
- **إدارة الموردين (Suppliers Management)**: سجل الموردين وكشوف الحسابات الميدانية والتحصيل.
- **شاشات نقاط البيع والحسابات العامة**: قيد التطوير والتكامل وفق المعايير المحاسبية.

---

## 🏗️ البنية التقنية (Tech Stack)

### الفرونت إند (Frontend)
- **Framework**: React 18+ مع TypeScript
- **Bundler**: Vite
- **UI Library**: Ant Design (RTL-native) مع تخصيصات TailwindCSS
- **Icons**: Lucide React & Ant Design Icons
- **State & Architecture**: Context API + Modular Architecture

### الباك إند (Backend)
- **Framework**: Laravel 12 (PHP 8.2+)
- **Architecture**: RESTful API (معمارية معايير المؤسسات v1)
- **Database**: SQLite (لبيئة التطوير المحلي) / MySQL (للإنتاج)
- **CORS & Security**: Laravel Sanctum & Handled CORS Headers

---

## 🚀 التشغيل المحلي (Getting Started)

### 1. المتطلبات الأساسية (Prerequisites)
- **PHP** >= 8.2
- **Composer**
- **Node.js** >= 18 & **npm**

### 2. إعداد وتشغيل الباك إند (Backend Setup)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```
> يعمل الـ API افتراضياً على: `http://127.0.0.1:8000`

### 3. إعداد وتشغيل الفرونت إند (Frontend Setup)
```bash
cd frontend
npm install
npm run dev
```
> تفتح الواجهة التفاعلية على: `http://localhost:3000`

---

## 📁 هيكلية المشروع (Project Structure)

```plaintext
rab7a/
├── AI_RULES/           # معايير وقواعد التطوير وجودة الكود والأمان
├── MODULES/            # التوثيق التفصيلي للوحدات الوظيفية
├── PROJECT.md          # مواصفات المشروع والمعمارية الشاملة
├── backend/            # تطبيق Laravel 12 API
│   ├── app/            # Controllers, Services, Models, Enums
│   ├── database/       # Migrations & Seeders
│   └── routes/         # api.php, web.php, console.php
└── frontend/           # تطبيق React + Vite SPA
    ├── src/
    │   ├── api/        # استدعاءات API والتكامل
    │   ├── components/ # مكونات الواجهة الموحدة والشاشات الفرعية
    │   ├── context/    # إدارة الحالة المشتركة (HrContext)
    │   ├── pages/      # صفحات الموارد البشرية، المخزون، الموردين، والمشتريات
    │   └── types/      # تعريفات TypeScript
```

---

## 🛡️ الأمان والخصوصية (Security & Privacy)
- جميع بيانات الاعتماد والمفاتيح السرية مستبعدة تماماً عبر `.gitignore`.
- الالتزام الصارم بمعايير فصل الصلاحيات والتحقق من صحة المدخلات.

---

## 📄 الترخيص (License)
هذا المشروع خاص ومملوك لـ **Rabha Restaurant Management** © 2026.

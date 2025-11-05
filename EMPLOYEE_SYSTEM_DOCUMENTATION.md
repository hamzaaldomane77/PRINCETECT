# نظام الموظفين - التوثيق

## نظرة عامة
تم إنشاء نظام منفصل تماماً للموظفين مع الحفاظ على نظام Super Admin الحالي.

## المسارات (Routes)

### 1. نظام Super Admin (الحالي)
- **صفحة تسجيل الدخول**: `/` (الصفحة الرئيسية)
- **لوحة التحكم**: `/super-admin`
- **المميزات**: 
  - إدارة العملاء
  - إدارة الموظفين
  - إدارة البيانات الأساسية
  - إدارة الخدمات
  - وثائق PDA
  - AIDA Funnels
  - قنوات التسويق
  - Marketing Mixes

### 2. نظام الموظفين (الجديد)
- **صفحة تسجيل الدخول**: `/employee/login`
- **لوحة التحكم**: `/employee/dashboard`
- **المميزات**:
  - مهامي: `/employee/my-tasks`
  - اجتماعاتي: `/employee/my-meetings`
  - عملائي: `/employee/my-clients`

## البنية التحتية

### 1. Auth Context
تم إنشاء Context منفصل للموظفين:
- **Super Admin**: `src/contexts/auth-context.tsx`
- **Employees**: `src/contexts/employee-auth-context.tsx`

**الفرق الرئيسي**:
- يستخدم نظام الموظفين مفاتيح LocalStorage مختلفة:
  - `employee-auth-token` (بدلاً من `auth-token`)
  - `employee-auth-user` (بدلاً من `auth-user`)
- نقطة نهاية API مختلفة: `employee/auth/login` (بدلاً من `admin/auth/login`)

### 2. مكونات تسجيل الدخول
- **Super Admin**: `src/components/auth/login-form.tsx`
- **Employees**: `src/components/auth/employee-login-form.tsx`

### 3. Layout Components
- **Super Admin**: `src/components/layout/admin-layout.tsx` & `sidebar.tsx`
- **Employees**: `src/components/layout/employee-layout.tsx` & `employee-sidebar.tsx`

### 4. الصفحات

#### صفحات Super Admin
```
src/app/
├── page.tsx (صفحة تسجيل دخول Super Admin)
└── super-admin/
    └── ... (جميع صفحات Super Admin)
```

#### صفحات الموظفين
```
src/app/employee/
├── layout.tsx (يوفر EmployeeAuthProvider)
├── login/
│   └── page.tsx (صفحة تسجيل دخول الموظفين)
├── dashboard/
│   ├── layout.tsx (يوفر EmployeeLayout)
│   └── page.tsx
├── my-tasks/
│   ├── layout.tsx
│   └── page.tsx
├── my-meetings/
│   ├── layout.tsx
│   └── page.tsx
└── my-clients/
    ├── layout.tsx
    └── page.tsx
```

## كيفية الاستخدام

### للمدراء (Super Admin)
1. اذهب إلى `/` (الصفحة الرئيسية)
2. ستظهر صفحة "تسجيل دخول المدير"
3. بعد تسجيل الدخول، سيتم توجيهك إلى `/super-admin`

### للموظفين
1. اذهب إلى `/employee/login`
2. ستظهر صفحة "تسجيل دخول الموظفين"
3. بعد تسجيل الدخول، سيتم توجيهك إلى `/employee/dashboard`

### التنقل بين الأنظمة
- من صفحة تسجيل دخول المدير: يوجد رابط "تسجيل دخول الموظفين" في الأسفل
- من صفحة تسجيل دخول الموظفين: يوجد رابط "تسجيل دخول المدير" في الأسفل

## الحماية (Authentication)

### Super Admin
- يستخدم `useAuth()` hook
- محمي بـ `ProtectedRoute` component
- يتحقق من الأدوار والصلاحيات

### الموظفين
- يستخدم `useEmployeeAuth()` hook
- محمي بـ `EmployeeLayout` component
- يعيد التوجيه إلى `/employee/login` إذا لم يكن المستخدم مسجلاً

## الربط بالـ Backend

### نقاط النهاية (Endpoints) المطلوبة

#### للمدراء (Super Admin)
```
POST /api/admin/auth/login
Body: { email, password }
Response: { success, data: { token, user } }
```

#### للموظفين
```
POST /api/employee/auth/login
Body: { email, password }
Response: { success, data: { token, user } }
```

### تحديث API Proxy
يجب تحديث `/api/proxy/login` لدعم نقطة النهاية الجديدة `employee/auth/login`.

## الخطوات القادمة

1. **ربط الموظفين بالـ Backend**:
   - إنشاء endpoint للموظفين في Backend
   - تحديث API proxy للتعامل مع طلبات الموظفين
   
2. **إضافة المميزات**:
   - إضافة وظائف لإدارة المهام
   - إضافة وظائف لإدارة الاجتماعات
   - إضافة وظائف لإدارة العملاء

3. **تخصيص الصلاحيات**:
   - إضافة نظام صلاحيات مخصص للموظفين
   - تحديد ما يمكن للموظف رؤيته وتعديله

## الألوان المميزة

### Super Admin
- اللون الأساسي: **Orange** (`orange-600`, `orange-500`)
- يستخدم في الأزرار والعناصر المميزة

### الموظفين
- اللون الأساسي: **Blue** (`blue-600`, `blue-500`)
- يستخدم في الأزرار والعناصر المميزة

هذا التمييز اللوني يساعد المستخدمين على معرفة أي نظام يستخدمون بسهولة.

## ملاحظات مهمة

1. **الفصل التام**: النظامان منفصلان تماماً في:
   - Authentication Context
   - LocalStorage Keys
   - API Endpoints
   - Routes
   - UI Components

2. **لا تداخل**: المستخدم المسجل في Super Admin لا يؤثر على نظام الموظفين والعكس صحيح

3. **جاهز للتوسع**: يمكن بسهولة إضافة المزيد من الصفحات والمميزات لكلا النظامين

4. **الحالة الحالية**: النظام جاهز من ناحية Frontend، يحتاج فقط للربط بالـ Backend


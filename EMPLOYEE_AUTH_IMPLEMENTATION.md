# Employee Authentication Implementation

## Overview
تم فصل نظام تسجيل دخول الموظفين بالكامل عن نظام Super Admin باستخدام API endpoint منفصل ومستقل.

## Structure

```
src/
├── modules/
│   └── employee-auth/                 # مجلد منفصل للموظفين
│       ├── types/
│       │   └── index.ts              # Types خاصة بالموظفين
│       ├── api/
│       │   └── employee-auth.ts      # API calls للموظفين
│       ├── hooks/
│       │   └── use-employee-auth.ts  # React Query hooks
│       └── index.ts                   # Exports
├── contexts/
│   └── employee-auth-context.tsx     # Context محدث
├── components/
│   └── auth/
│       ├── employee-login-form.tsx   # Form محدث
│       └── employee-protected-route.tsx
└── config/
    └── api.ts                        # BASE_URL configuration
```

## API Configuration

### Base URL
```typescript
import { BASE_URL } from '@/config/api';
// BASE_URL = 'https://princetect.peaklink.pro'
```

### Employee Login Endpoint
```
POST {{BASE_URL}}/api/v1/employee/auth/login
```

### Request Body
```json
{
  "email": "ahmed@company.com",
  "password": "password"
}
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "token": "38|4N5dUDMsynzpI4poEofVlFNq28f1oCQgw75c2wjne0690678",
    "token_type": "Bearer",
    "expires_in": 0,
    "user": {
      "id": 1,
      "employee_id": "EMP001",
      "full_name": "أحمد محمد",
      "first_name": "أحمد",
      "last_name": "محمد",
      "email": "ahmed@company.com",
      "phone": "+966501234567",
      "photo": null,
      "department": {
        "id": 1,
        "name": "قسم التسويق الرقمي"
      },
      "job_title": {
        "id": 1,
        "name": "مدير تسويق رقمي"
      },
      "is_manager": true,
      "is_department_manager": false,
      "permissions": [...],
      "roles": ["manager"],
      "workload": {
        "percentage": 0,
        "active_tasks": 0,
        "overdue_tasks": 0
      }
    }
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

## Key Features

### 1. Separate Module Structure
- ✅ مجلد `modules/employee-auth/` منفصل تماماً عن Super Admin
- ✅ Types خاصة بالموظفين (EmployeeUser, EmployeeLoginCredentials)
- ✅ API methods مخصصة تستخدم BASE_URL من config
- ✅ React Query hooks للإدارة

### 2. Employee User Type
```typescript
interface EmployeeUser {
  id: number;
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo: string | null;
  department: EmployeeDepartment;
  job_title: EmployeeJobTitle;
  is_manager: boolean;
  is_department_manager: boolean;
  permissions: string[];
  roles: string[];
  workload: EmployeeWorkload;
}
```

### 3. Authentication Context
تم تحديث `employee-auth-context.tsx` لاستخدام:
- `EmployeeAuthAPI.login()` للتواصل مع الـ API
- `EmployeeUser` type بدلاً من `User`
- `EmployeeLoginCredentials` بدلاً من `LoginCredentials`

### 4. Storage
يتم حفظ البيانات في localStorage مع prefix خاص:
- `employee-auth-token` - JWT token
- `employee-auth-user` - بيانات المستخدم كاملة

### 5. Permission System
النظام يدعم:
- `hasRole(role)` - التحقق من دور واحد
- `can(permission)` - التحقق من صلاحية واحدة
- `hasAnyRole(roles[])` - التحقق من أي دور من القائمة
- `hasAnyPermission(permissions[])` - التحقق من أي صلاحية
- `hasAllPermissions(permissions[])` - التحقق من كل الصلاحيات

## Usage Examples

### 1. Login
```typescript
import { useEmployeeAuth } from '@/contexts/employee-auth-context';

function LoginForm() {
  const { login, isLoading } = useEmployeeAuth();
  
  const handleLogin = async () => {
    await login({
      email: 'ahmed@company.com',
      password: 'password'
    });
  };
}
```

### 2. Protected Routes
```typescript
import { EmployeeProtectedRoute } from '@/components/auth/employee-protected-route';

function EmployeeDashboard() {
  return (
    <EmployeeProtectedRoute requiredPermissions={['view_tasks']}>
      <div>Dashboard Content</div>
    </EmployeeProtectedRoute>
  );
}
```

### 3. Check Permissions
```typescript
const { user, can, hasRole } = useEmployeeAuth();

if (can('create_customers')) {
  // Show create button
}

if (hasRole('manager')) {
  // Show manager features
}
```

## API Methods

### EmployeeAuthAPI.login()
```typescript
static async login(
  credentials: EmployeeLoginCredentials
): Promise<EmployeeLoginResponse>
```

### EmployeeAuthAPI.logout()
```typescript
static async logout(token: string): Promise<void>
```

### EmployeeAuthAPI.verifyToken()
```typescript
static async verifyToken(token: string): Promise<boolean>
```

### EmployeeAuthAPI.refreshToken()
```typescript
static async refreshToken(
  token: string
): Promise<{ token: string } | null>
```

## Production Credentials
للاستخدام الحقيقي:
- يجب إدخال البيانات الفعلية من الـ Backend
- لا توجد بيانات تجريبية في الإنتاج
- النظام يتصل مباشرة بـ: `{{BASE_URL}}/api/v1/employee/auth/login`

## Error Handling
النظام يتعامل مع الأخطاء التالية:
- ❌ 401: بيانات دخول خاطئة
- ❌ 404: خدمة غير متاحة
- ❌ 422: بيانات غير صحيحة (validation errors)
- ❌ 500: خطأ في الخادم
- ❌ Network errors: مشاكل الاتصال

## Separation from Super Admin

### Super Admin
- Endpoint: `/api/v1/admin/auth/login`
- Context: `auth-context.tsx`
- Storage: `auth-token`, `auth-user`
- Types: `User`, `LoginCredentials`

### Employee
- Endpoint: `/api/v1/employee/auth/login`
- Context: `employee-auth-context.tsx`
- Storage: `employee-auth-token`, `employee-auth-user`
- Types: `EmployeeUser`, `EmployeeLoginCredentials`

## Next Steps
يمكن توسيع النظام بإضافة:
- Token refresh mechanism
- Password reset functionality
- Profile management
- Session timeout handling
- Multi-factor authentication

## Route Protection

### EmployeeLayout Protection
يستخدم `EmployeeLayout` نظام حماية متعدد الطبقات:

1. **Loading State**: يعرض شاشة تحميل أثناء التحقق من المصادقة
2. **Authentication Check**: يتحقق من `isAuthenticated` و `isLoading`
3. **Auto Redirect**: يعيد توجيه المستخدم إلى `/employee/login` إذا لم يكن مصادقاً
4. **User Validation**: يتحقق من وجود بيانات المستخدم

```typescript
// في EmployeeLayout
const { user, isAuthenticated, isLoading } = useEmployeeAuth();

// إعادة توجيه تلقائية
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/employee/login');
  }
}, [isAuthenticated, isLoading, router]);
```

### EmployeeProtectedRoute Component
للحماية المتقدمة بناءً على الصلاحيات:

```typescript
<EmployeeProtectedRoute 
  requiredPermissions={['view_tasks']}
  requireAllPermissions={true}
>
  <SensitiveContent />
</EmployeeProtectedRoute>
```

### Available Protection Wrappers
```typescript
// For single permission
<WithEmployeePermission permission="create_customers">
  <CreateButton />
</WithEmployeePermission>

// For multiple permissions (any)
<WithAnyEmployeePermission permissions={['view_tasks', 'view_meetings']}>
  <DashboardWidget />
</WithAnyEmployeePermission>
```

## Testing
1. افتح `/employee/login`
2. أدخل بيانات الموظف الفعلية
3. تحقق من الـ Console للتأكد من نجاح الطلب
4. سيتم التوجيه إلى `/employee/dashboard` عند النجاح
5. جرب الوصول إلى `/employee/dashboard` بدون تسجيل دخول - سيتم إعادة توجيهك تلقائياً

## Notes
- ✅ النظام منفصل تماماً عن Super Admin
- ✅ يستخدم BASE_URL من config/api.ts
- ✅ يدعم permissions و roles كاملة
- ✅ يحفظ workload statistics للموظف
- ✅ يدعم department و job_title information


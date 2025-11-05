import ClientOnly from '@/components/ui/client-only';
import EmployeeLoginForm from '@/components/auth/employee-login-form';

export default function EmployeeLoginPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <EmployeeLoginForm />
    </ClientOnly>
  );
}


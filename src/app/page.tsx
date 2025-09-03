import ClientOnly from '@/components/ui/client-only';
import LoginForm from '@/components/auth/login-form';

export default function Home() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    }>
      <LoginForm />
    </ClientOnly>
  );
}

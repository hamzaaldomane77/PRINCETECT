'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { LoginCredentials } from '@/types/auth';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

export default function EmployeeLoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, isAuthenticated, user } = useEmployeeAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`);
      
      // Redirect to employee dashboard after a short delay
      setTimeout(() => {
        router.push('/employee/dashboard');
      }, 1000);
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const loadingToast = toast.loading('جاري تسجيل الدخول...');
    
    try {
      await login(credentials);
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Employee login error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        const errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const fillDemoCredentials = () => {
    setCredentials({
      email: 'employee@demo.com',
      password: 'employee123'
    });
    if (error) setError('');
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                تسجيل دخول الموظفين
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                أدخل بياناتك للوصول لنظام الموظفين
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-700 dark:text-red-300 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  البريد الإلكتروني
                </Label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="أدخل كلمة المرور"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  🔐 بيانات الدخول التجريبية:
                </p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  disabled={isLoading}
                >
                  ملء تلقائي
                </button>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>البريد الإلكتروني: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">employee@demo.com</code></p>
                <p>كلمة المرور: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">employee123</code></p>
              </div>
            </div>

            {/* Link to Super Admin Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                هل أنت مدير؟{' '}
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  تسجيل دخول المدير
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


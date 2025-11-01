'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { LoginCredentials } from '@/types/auth';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

export default function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Show success toast
      toast.success(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`);
      
      // Redirect to super admin after a short delay
      setTimeout(() => {
        router.push('/super-admin');
      }, 1000);
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Show loading toast
    const loadingToast = toast.loading('جاري تسجيل الدخول...');
    
    try {
      await login(credentials);
      // Success toast will be shown in useEffect
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Login error:', err);
      
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
    // Clear error when user starts typing
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
                تسجيل الدخول
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                أدخل بياناتك للوصول للنظام
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
                email
                </Label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                password                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white"
                   
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
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            {/* Demo Credentials */}
           
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
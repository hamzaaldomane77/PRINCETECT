'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { EmployeeLoginCredentials } from '@/modules/employee-auth';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

export default function EmployeeLoginForm() {
  const [credentials, setCredentials] = useState<EmployeeLoginCredentials>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, isAuthenticated, user } = useEmployeeAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome ${user.full_name}! Logged in successfully`);
      
      // Redirect to employee dashboard after a short delay
      setTimeout(() => {
        router.push('/employee/dashboard');
      }, 1000);
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const loadingToast = toast.loading('Logging in...');
    
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
        const errorMessage = 'An unexpected error occurred, please try again';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleInputChange = (field: keyof EmployeeLoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
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
                Employee Login
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter your credentials to access the employee system
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
                  Email
                </Label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter your password"
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
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </>
  );
}


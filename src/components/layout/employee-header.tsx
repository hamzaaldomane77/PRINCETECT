'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, LogoutIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';

export default function EmployeeHeader() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { logout, user } = useEmployeeAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Show logout toast
      toast.success('Logged out successfully');
      
      // Perform logout
      await logout();
      
      // Close dialog
      setIsLogoutDialogOpen(false);
      
      // Force redirect to employee login page
      setTimeout(() => {
        router.replace('/employee/login');
        
        // Fallback to window.location after 500ms
        setTimeout(() => {
          if (!window.location.pathname.includes('/employee/login')) {
            console.log('Using window.location fallback to employee login');
            window.location.href = '/employee/login';
          }
        }, 500);
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
      // Force redirect even on error
      window.location.href = '/employee/login';
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 h-17 flex-shrink-0">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Page title */}
          <div className="flex-1">
        
          </div>

          {/* Right side - Profile, Logout */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Section */}
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.full_name || 'Employee'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'employee@example.com'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => router.push('/employee/profile')}
                  title="Profile"
                >
                  <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>

              {/* User Role Badge */}
              {user?.roles && user.roles.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {user.roles[0]}
                </Badge>
              )}

              {/* Department Badge */}
              {user?.department && (
                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                  {user.department.name}
                </Badge>
              )}

              {/* Logout Button with Alert Dialog */}
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-3 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-600 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogoutIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">Logout</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}


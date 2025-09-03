'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, BellIcon, UserIcon, LogoutIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    // Show logout toast
    toast.success('Logged out successfully');
    
    // Perform logout
    logout();
    
    // Force redirect to login page with multiple fallback methods
    setTimeout(() => {
      try {
        // Method 1: router.push
        router.push('/');
        
        // Method 2: window.location as fallback after 500ms
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            console.log('Using window.location fallback');
            window.location.href = '/';
          }
        }, 500);
      } catch (error) {
        console.error('Redirect error:', error);
        // Fallback to window.location immediately
        window.location.href = '/';
      }
    }, 1000);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 h-17 flex-shrink-0">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Page title */}
          <div className="flex-1">
        
          </div>

          {/* Right side - Search, Notifications, Profile, Logout */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-white"
              />
              <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Notification Icon */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2 cursor-pointer">
                <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </Button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Section */}
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'المستخدم'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-2 cursor-pointer">
                  <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>

              {/* User Role Badge */}
              {user?.roles && user.roles.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {user?.roles.includes('super_admin') ? 'Super Admin' : user.roles[0]}
                </Badge>
              )}

              {/* Logout Button with Alert Dialog */}
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-3 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-600 transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogoutIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">تسجيل الخروج</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout from the system?
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
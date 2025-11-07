'use client';

import { useEffect, useState } from 'react';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { useEmployeeProfile } from '@/modules/employee-auth';
import { EmployeeLayout } from '@/components/layout/employee-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  BuildingIcon,
  BriefcaseIcon,
  TrendingUpIcon
} from '@/components/ui/icons';
import Image from 'next/image';

export default function EmployeeProfilePage() {
  const { user, token, isAuthenticated, isLoading } = useEmployeeAuth();
  const profileMutation = useEmployeeProfile(token || '');
  const [profileData, setProfileData] = useState(user);

  useEffect(() => {
    if (token && isAuthenticated) {
      // Fetch fresh profile data from API silently
      profileMutation.mutate(undefined, {
        onSuccess: (response) => {
          if (response.success && response.data) {
            setProfileData(response.data);
          }
        },
      });
    }
  }, [token, isAuthenticated]);

  // Security check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            غير مصرح بالدخول
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            يجب تسجيل الدخول أولاً
          </p>
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex items-center gap-6">
          {/* Profile Image */}
          <div className="relative">
            {displayUser.photo ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <Image
                  src={displayUser.photo}
                  alt={displayUser.full_name}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-2xl">
                <span className="text-5xl font-bold text-white">
                  {displayUser.first_name?.charAt(0)}{displayUser.last_name?.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900"></div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {displayUser.full_name}
            </h1>
            <p className="text-blue-100 text-lg mb-3">
              {displayUser.job_title?.name}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {displayUser.employee_id}
              </Badge>
              {displayUser.roles?.map((role: string) => (
                <Badge key={role} className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {role}
                </Badge>
              ))}
              {displayUser.is_manager && (
                <Badge className="bg-orange-500/90 text-white border-orange-400/50">
                  مدير
                </Badge>
              )}
              {displayUser.is_department_manager && (
                <Badge className="bg-purple-500/90 text-white border-purple-400/50">
                  مدير قسم
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                معلومات الاتصال
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <MailIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">البريد الإلكتروني</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mr-7">
                  {displayUser.email}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <PhoneIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">رقم الهاتف</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mr-7" dir="ltr">
                  {displayUser.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                معلومات العمل
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <BuildingIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">القسم</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mr-7">
                  {displayUser.department?.name}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <BriefcaseIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">المسمى الوظيفي</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mr-7">
                  {displayUser.job_title?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workload Statistics */}
        {displayUser.workload && (
          <Card className="lg:col-span-3 hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  إحصائيات حمل العمل
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative">
                    <p className="text-sm font-medium opacity-90 mb-2">نسبة الحمل</p>
                    <p className="text-4xl font-bold mb-1">{displayUser.workload.percentage}%</p>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${displayUser.workload.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative">
                    <p className="text-sm font-medium opacity-90 mb-2">المهام النشطة</p>
                    <p className="text-4xl font-bold mb-1">{displayUser.workload.active_tasks}</p>
                    <p className="text-sm opacity-75 mt-3">قيد التنفيذ حالياً</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative">
                    <p className="text-sm font-medium opacity-90 mb-2">المهام المتأخرة</p>
                    <p className="text-4xl font-bold mb-1">{displayUser.workload.overdue_tasks}</p>
                    <p className="text-sm opacity-75 mt-3">تحتاج إلى متابعة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
    </EmployeeLayout>
  );
}


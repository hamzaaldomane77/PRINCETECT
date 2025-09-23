'use client';

import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent } from '@/components/ui/card';

function ProfileContent() {
  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#D69235] dark:text-orange-400 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Profile Management Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This feature is under development. You&apos;ll be able to manage your profile here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

export default function Profile() {
  return <ProfileContent />;
} 
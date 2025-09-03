'use client';

import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeesPage() {
  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage employee information and profiles</p>
          </div>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">👥 Employees Management</CardTitle>
              <CardDescription className="dark:text-gray-400">
                This feature is coming soon. You will be able to manage employee information and profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                The employees management system will allow you to:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Add and manage employee profiles</li>
                <li>• Track employee information</li>
                <li>• Manage employee assignments</li>
                <li>• Generate employee reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
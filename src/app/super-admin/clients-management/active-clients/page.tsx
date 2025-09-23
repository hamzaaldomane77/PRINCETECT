'use client';

import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActiveCustomersPage() {
  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Customers</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage active customer relationships</p>
          </div>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">✅ Active Customers</CardTitle>
              <CardDescription className="dark:text-gray-400">
                This feature is coming soon. You will be able to manage active customer relationships.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                The active customers system will allow you to:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>• View active customer list</li>
                <li>• Track customer engagement</li>
                <li>• Manage customer relationships</li>
                <li>• Generate customer reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
'use client';

import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContractsPage() {
  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage customer contracts and agreements</p>
          </div>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">📋 Contracts Management</CardTitle>
              <CardDescription className="dark:text-gray-400">
                This feature is coming soon. You will be able to manage customer contracts and agreements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                The contracts management system will allow you to:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Create and manage contracts</li>
                <li>• Track contract status</li>
                <li>• Manage contract templates</li>
                <li>• Generate contract reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
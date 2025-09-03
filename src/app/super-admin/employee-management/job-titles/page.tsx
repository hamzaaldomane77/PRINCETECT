'use client';

import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobTitlesPage() {
  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Titles</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage job titles and positions</p>
          </div>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">💼 Job Titles</CardTitle>
              <CardDescription className="dark:text-gray-400">
                This feature is coming soon. You will be able to manage job titles and positions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                The job titles system will allow you to:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Create job title categories</li>
                <li>• Define job responsibilities</li>
                <li>• Assign employees to titles</li>
                <li>• Generate title reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PdaDocumentsIcon } from '@/components/ui/icons';

export default function MyTasksPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مهامي</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة وتتبع مهامك اليومية</p>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <PdaDocumentsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد مهام حالياً
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              سيتم عرض مهامك هنا بمجرد ربط النظام بالـ Backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


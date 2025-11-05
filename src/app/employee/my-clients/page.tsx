'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CustomersIcon } from '@/components/ui/icons';

export default function MyClientsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">عملائي</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة ومتابعة عملائك</p>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <CustomersIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا يوجد عملاء حالياً
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              سيتم عرض عملائك هنا بمجرد ربط النظام بالـ Backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


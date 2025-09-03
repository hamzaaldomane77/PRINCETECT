'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, TagIcon, FileTextIcon, CalendarIcon, HashIcon, CodeIcon } from '@/components/ui/icons';
import { useServiceCategory } from '@/modules/service-categories';

export default function ServiceCategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Service Categories', href: '/super-admin/services-management/service-categories' },
    { label: 'Category Details' }
  ];

  // Fetch category details
  const { 
    data: currentCategory, 
    isLoading, 
    error, 
    refetch 
  } = useServiceCategory(categoryId);

  const handleBack = () => {
    router.push('/super-admin/services-management/service-categories');
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading category details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !currentCategory) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Category Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested category could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Categories
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBack} variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentCategory.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Service Category Details
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Core category details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category Name</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {currentCategory.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HashIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category ID</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          #{currentCategory.id}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CodeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category Code</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                          {currentCategory.code}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                        </div>
                        <Badge variant={currentCategory.is_active ? "default" : "secondary"}>
                          {currentCategory.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {currentCategory.description && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentCategory.description}
                        </p>
                      </div>
                    )}

                    {currentCategory.notes && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentCategory.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status and Metadata */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category Status</span>
                      <Badge variant={currentCategory.is_active ? "default" : "secondary"}>
                        {currentCategory.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(currentCategory.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(currentCategory.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Icon */}
             
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
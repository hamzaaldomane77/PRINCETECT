'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useServices, useDeleteService, useToggleServiceStatus } from '@/modules/services';
import { Service } from '@/modules/services/types';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Services' }
  ];

  // Fetch services using the hook
  const { 
    data: servicesResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useServices();

  const services = servicesResponse?.data.services || [];

  // Mutations
  const deleteServiceMutation = useDeleteService();
  const toggleStatusMutation = useToggleServiceStatus();

  const handleCreateService = () => {
    router.push('/super-admin/services-management/services/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteServiceMutation.mutateAsync(serviceToDelete.id);
      toast.success('Service deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Service Name', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'category', label: 'Category', type: 'text', align: 'center' },
    { key: 'department', label: 'Department', type: 'text', align: 'center' },
    { key: 'base_price', label: 'Base Price', type: 'text', align: 'center' },
    { key: 'currency', label: 'Currency', type: 'text', align: 'center' },
    { key: 'delivery_time_days', label: 'Delivery Time', type: 'text', align: 'center' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Service',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (service: Service) => {
        router.push(`/super-admin/services-management/services/${service.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Service',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (service: Service) => {
        router.push(`/super-admin/services-management/services/${service.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Service',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteService
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    console.log('Filter clicked');
    // TODO: Implement filter functionality
  };

  // Transform services data for the table
  const transformedServices = services.map(service => ({
    ...service,
    category: service.category?.name || 'N/A',
    department: service.department?.name || 'N/A',
    base_price: `${service.base_price} ${service.currency}`,
    delivery_time_days: `${service.delivery_time_days} days`,
    created_at: new Date(service.created_at).toLocaleDateString('ar-SA'),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Services
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        
        {/* Specific error handling for common issues */}
        {error.message.includes('Authentication required') && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Authentication Issue:</strong> The API requires authentication. 
              This might be due to missing login routes in your Laravel backend.
            </p>
          </div>
        )}
        
        {error.message.includes('API endpoint not found') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>API Endpoint Issue:</strong> The services API endpoint is not accessible. 
              Please check your Laravel routes and ensure the API is properly configured.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
          
          <Button
            onClick={() => window.open('http://princetect.peaklink.pro/api/v1/admin/services', '_blank')}
            variant="outline"
          >
            Test API Directly
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading services...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage company services and offerings</p>
              </div>

              {/* Error Display */}
              <ErrorDisplay error={error} onRetry={handleRetry} />
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage company services and offerings</p>
            </div>
            
            {/* Create Service Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateService}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Service</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {services.length > 0 ? (
                <DataTable
                  data={transformedServices}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search services..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  defaultItemsPerPage={10}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Services Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No services are currently available. Create your first service to get started.
                    </p>
                    <Button
                      onClick={handleCreateService}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Service
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف الخدمة &quot;{serviceToDelete?.name}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteServiceMutation.isPending}
              >
                {deleteServiceMutation.isPending ? 'جاري الحذف...' : 'حذف الخدمة'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
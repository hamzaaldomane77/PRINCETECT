'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, RefreshIcon, CheckIcon, XIcon } from '@/components/ui/icons';
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
import { useClients, useUpdateClient } from '@/modules/clients';
import { Client } from '@/modules/clients/types';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

const industryColors = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  education: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  retail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manufacturing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  services: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const sizeColors = {
  startup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  small: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  large: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enterprise: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function ActiveClientsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [clientToUpdate, setClientToUpdate] = useState<Client | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Active Clients' }
  ];

  // Fetch active clients using the hook
  const { 
    data: clientsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useClients({ status: 'active' });

  const clients = clientsResponse?.data.clients || [];

  // Mutations
  const updateClientMutation = useUpdateClient();

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeactivateClient = (client: Client) => {
    setClientToUpdate(client);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!clientToUpdate) return;
    
    try {
      await updateClientMutation.mutateAsync({
        id: clientToUpdate.id,
        data: { status: 'inactive' }
      });
      toast.success('Client status updated successfully!');
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to update this client.');
      } else {
        setErrorMessage('Failed to update client status. Please try again.');
        setErrorDialogOpen(true);
      }
    } finally {
      setStatusDialogOpen(false);
      setClientToUpdate(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'logo', label: 'Logo', type: 'logo', width: '60px' },
    { key: 'name', label: 'Client Name', type: 'text', align: 'right' },
    { key: 'company_name', label: 'Company Name', type: 'text', align: 'right' },
    { key: 'contact_person', label: 'Contact Person', type: 'text', align: 'right' },
    { key: 'email', label: 'Email', type: 'text', align: 'right' },
    { key: 'phone', label: 'Phone', type: 'text', align: 'right' },
    { key: 'city', label: 'City', type: 'text', align: 'center' },
    { 
      key: 'industry', 
      label: 'Industry', 
      type: 'badge', 
      align: 'center',
      badgeColors: industryColors
    },
    { 
      key: 'size', 
      label: 'Size', 
      type: 'badge', 
      align: 'center',
      badgeColors: sizeColors
    },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (client: Client) => {
        router.push(`/super-admin/clients-management/clients/${client.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Client',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (client: Client) => {
        router.push(`/super-admin/clients-management/clients/${client.id}/edit`);
      }
    },
    {
      icon: XIcon,
      label: 'Deactivate Client',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeactivateClient
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

  // Transform clients data for the table
  const transformedClients = clients.map(client => ({
    id: client.id,
    logo: getImageUrl(client.logo, '/placeholder-logo.svg'),
    name: client.name,
    company_name: client.company_name || 'N/A',
    contact_person: client.contact_person || 'N/A',
    email: client.email || 'N/A',
    phone: client.phone || 'N/A',
    city: client.city?.name || 'N/A',
    // Return simple string values for badges - DataTable will handle badge rendering
    industry: client.industry || 'other',
    size: client.size || 'small',
    created_at: client.created_at,
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Active Clients
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading active clients...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Clients</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your active client database</p>
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Clients</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your active client database</p>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {clients.length > 0 ? (
                <DataTable
                  data={transformedClients}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search active clients..."
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
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Active Clients Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      There are no active clients currently available.
                    </p>
                    <Button
                      onClick={() => router.push('/super-admin/clients-management/clients')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      View All Clients
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Change Confirmation Dialog */}
        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate the client &quot;{clientToUpdate?.name}&quot;? 
                <br />
                <span className="text-amber-600 font-medium">This will make the client inactive.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmStatusChange}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={updateClientMutation.isPending}
              >
                {updateClientMutation.isPending ? 'Updating...' : 'Deactivate Client'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Error
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}
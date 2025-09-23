'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useClients, useDeleteClient } from '@/modules/clients';
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

export default function CustomersPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Clients' }
  ];

  // Fetch clients using the hook
  const { 
    data: clientsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useClients();

  const clients = clientsResponse?.data.clients || [];

  // Mutations
  const deleteClientMutation = useDeleteClient();

  const handleCreateCustomer = () => {
        router.push('/super-admin/clients-management/clients/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);
      toast.success('Client deleted successfully!');
      refetch();
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'CANNOT_DELETE_CLIENT_WITH_RELATIONS' || 
          errorMsg.includes('has active contracts') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this client because they have active contracts or relationships.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this client.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Client not found. It may have been already deleted.');
        refetch(); // Refresh the list since it might be outdated
      } else {
        toast.error('Failed to delete client. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
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
    { key: 'mobile', label: 'Mobile', type: 'text', align: 'right' },
    { key: 'city', label: 'City', type: 'text', align: 'center' },
    { key: 'industry', label: 'Industry', type: 'text', align: 'center' },
    { key: 'size', label: 'Size', type: 'text', align: 'center' },
    { key: 'status', label: 'Status', type: 'text', align: 'center' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
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
      icon: TrashIcon,
      label: 'Delete Client',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteClient
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

  // Function to format date with day, month, year
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Transform clients data for the table
  const transformedClients = clients.map(client => ({
    ...client,
    logo: getImageUrl(client.logo, '/placeholder-logo.svg'),
    city: client.city?.name || 'N/A',
    industry: client.industry ? (
      <Badge className={industryColors[client.industry] || industryColors.other}>
        {client.industry.charAt(0).toUpperCase() + client.industry.slice(1)}
      </Badge>
    ) : 'N/A',
    size: client.size ? (
      <Badge className={sizeColors[client.size] || sizeColors.small}>
        {client.size.charAt(0).toUpperCase() + client.size.slice(1)}
      </Badge>
    ) : 'N/A',
    status: (
      <Badge className={statusColors[client.status] || statusColors.inactive}>
        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
      </Badge>
    ),
    company_name: client.company_name || 'N/A',
    contact_person: client.contact_person || 'N/A',
    phone: client.phone || 'N/A',
    mobile: client.mobile || 'N/A',
    created_at: formatDate(client.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Clients
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading clients...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
            </div>
            
            {/* Create Customer Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateCustomer}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add New Client</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {clients.length > 0 ? (
              <DataTable
                  data={transformedClients}
                columns={columns}
                actions={actions}
                searchable={true}
                  searchPlaceholder="Search clients..."
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
                      No Clients Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No clients are currently available. Create your first client to get started.
                    </p>
                    <Button
                      onClick={handleCreateCustomer}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Client
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
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the client &quot;{clientToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteClientMutation.isPending}
              >
                {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Cannot Delete
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
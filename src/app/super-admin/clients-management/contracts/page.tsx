'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, MoreVerticalIcon, CalendarIcon } from '@/components/ui/icons';
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
import { useContracts, useDeleteContract, useAddContractService } from '@/modules/contracts';
import { Contract } from '@/modules/contracts/types';
import { useServices } from '@/modules/services';
import { toast } from 'sonner';

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
};

const paymentTermsColors = {
  upfront: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  monthly: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  milestone: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export default function ContractsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  
  // Add service modal state
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    service_id: '',
    quantity: '1',
    unit_price: '',
    delivery_date: '',
    description: '',
    notes: ''
  });
  
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Contracts' }
  ];

  // Fetch contracts using the hook
  const { 
    data: contractsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useContracts();

  const contracts = contractsResponse?.data?.contracts || [];

  // Services lookup - fetch all active services
  const { data: servicesResponse, isLoading: isLoadingServices } = useServices({ active: true });
  const services = servicesResponse?.data?.services || [];

  // Mutations
  const deleteContractMutation = useDeleteContract();
  const addServiceMutation = useAddContractService();

  const handleCreateContract = () => {
    router.push('/super-admin/clients-management/contracts/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractToDelete) return;
    
    try {
      await deleteContractMutation.mutateAsync(contractToDelete.id);
      toast.success('Contract deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  // Helper function to format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date);
      setServiceFormData(prev => ({ ...prev, delivery_date: formattedDate }));
    }
    setDeliveryDateOpen(false);
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find((s: any) => s.id.toString() === serviceId);
    setServiceFormData(prev => ({
      ...prev,
      service_id: serviceId,
      unit_price: selectedService?.base_price || prev.unit_price,
      description: selectedService?.description || prev.description
    }));
  };

  const handleAddService = (contract: Contract) => {
    setCurrentContract(contract);
    setServiceFormData({
      service_id: '',
      quantity: '1',
      unit_price: '',
      delivery_date: '',
      description: '',
      notes: ''
    });
    setAddServiceModalOpen(true);
  };

  const handleAddServiceSubmit = async () => {
    if (!currentContract) return;

    try {
      await addServiceMutation.mutateAsync({
        contractId: currentContract.id,
        data: {
          service_id: parseInt(serviceFormData.service_id),
          quantity: parseInt(serviceFormData.quantity),
          unit_price: parseFloat(serviceFormData.unit_price),
          delivery_date: serviceFormData.delivery_date,
          description: serviceFormData.description || undefined,
          notes: serviceFormData.notes || undefined
        }
      });
      
      toast.success('Service added to contract successfully!');
      setAddServiceModalOpen(false);
      setCurrentContract(null);
      setServiceFormData({
        service_id: '',
        quantity: '1',
        unit_price: '',
        delivery_date: '',
        description: '',
        notes: ''
      });
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add service:', error);
      toast.error('Failed to add service. Please try again.');
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'contract_number', label: 'Contract Number', type: 'text', align: 'left' },
    { key: 'title', label: 'Title', type: 'text', align: 'left' },
    { key: 'client', label: 'Client', type: 'text', align: 'left' },
    { key: 'total_amount', label: 'Total Amount', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'text', align: 'center' },
    { key: 'payment_terms', label: 'Payment Terms', type: 'text', align: 'center' },
    { key: 'start_date', label: 'Start Date', type: 'date', align: 'center' },
    { key: 'end_date', label: 'End Date', type: 'date', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: MoreVerticalIcon,
      label: 'Actions',
      color: 'text-gray-600 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      onClick: () => {}, // Empty function since we use dropdown
      dropdownItems: [
        {
          icon: EyeIcon,
          label: 'View Contract',
          onClick: (contract: Contract) => {
            router.push(`/super-admin/clients-management/contracts/${contract.id}`);
          }
        },
        {
          icon: EditIcon,
          label: 'Edit Contract',
          onClick: (contract: Contract) => {
            router.push(`/super-admin/clients-management/contracts/${contract.id}/edit`);
          }
        },
        {
          icon: PlusIcon,
          label: 'Add Services',
          onClick: handleAddService,
          className: 'text-purple-600 dark:text-purple-400'
        },
        {
          icon: TrashIcon,
          label: 'Delete Contract',
          onClick: handleDeleteContract,
          className: 'text-red-600 dark:text-red-400'
        }
      ]
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

  // Transform contracts data for the table
  const transformedContracts = contracts.map(contract => ({
    ...contract,
    client: contract.client ? (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white">{contract.client.name}</span>
        {contract.client.company_name && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{contract.client.company_name}</span>
        )}
      </div>
    ) : contract.lead ? (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white">{contract.lead.name}</span>
        {contract.lead.company_name && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{contract.lead.company_name}</span>
        )}
      </div>
    ) : '-',
    total_amount: (
      <div className="text-right">
        <span className="font-medium">{parseFloat(contract.total_amount).toLocaleString()}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{contract.currency}</span>
      </div>
    ),
    status: (
      <Badge className={statusColors[contract.status] || statusColors.active}>
        {contract.status.toUpperCase()}
      </Badge>
    ),
    payment_terms: (
      <Badge className={paymentTermsColors[contract.payment_terms] || paymentTermsColors.upfront}>
        {contract.payment_terms.replace('_', ' ').toUpperCase()}
      </Badge>
    ),
    // Pass dates as-is, let DataTable handle formatting
    start_date: contract.start_date,
    end_date: contract.end_date,
    created_at: contract.created_at,
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Contracts
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
              <strong>API Endpoint Issue:</strong> The contracts API endpoint is not accessible. 
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
            onClick={() => window.open('http://princetect.peaklink.pro/api/v1/admin/contracts', '_blank')}
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading contracts...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your business contracts</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your business contracts</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateContract}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Contract</span>
                </Button>
              </div>
            </div>
          
            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {contracts.length > 0 ? (
                <DataTable
                  data={transformedContracts}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search contracts..."
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
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Contracts Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No contracts are currently available. Create your first contract to get started.
                    </p>
                    <Button
                      onClick={handleCreateContract}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Contract
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Service Modal */}
        <Dialog open={addServiceModalOpen} onOpenChange={setAddServiceModalOpen}>
          <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
              <DialogDescription>
                Add a new service to contract #{currentContract?.contract_number}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service_id" className="text-right">
                  Service
                </Label>
                <Select 
                  value={serviceFormData.service_id} 
                  onValueChange={handleServiceChange}
                  disabled={isLoadingServices}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={isLoadingServices ? "Loading services..." : "Select service"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length > 0 ? (
                      services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name}
                          {service.base_price && service.currency && ` - ${service.base_price} ${service.currency}`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-gray-500">No services available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={serviceFormData.quantity}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit_price" className="text-right">
                  Unit Price
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceFormData.unit_price}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="delivery_date" className="text-right">
                  Delivery Date
                </Label>
                <div className="col-span-3">
                  <Popover open={deliveryDateOpen} onOpenChange={setDeliveryDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !serviceFormData.delivery_date && 'text-muted-foreground'
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {serviceFormData.delivery_date ? formatDate(serviceFormData.delivery_date) : 'Select delivery date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={serviceFormData.delivery_date ? new Date(serviceFormData.delivery_date) : undefined}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Service description..."
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={serviceFormData.notes}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddServiceModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddServiceSubmit}
                disabled={addServiceMutation.isPending || !serviceFormData.service_id || !serviceFormData.unit_price || !serviceFormData.delivery_date}
              >
                {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف العقد &quot;{contractToDelete?.title}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteContractMutation.isPending}
              >
                {deleteContractMutation.isPending ? 'جاري الحذف...' : 'حذف العقد'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
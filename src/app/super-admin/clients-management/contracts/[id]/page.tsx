'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, EditIcon, TrashIcon, PlusIcon, CalendarIcon } from '@/components/ui/icons';
import { 
  useContract, 
  useDeleteContract, 
  useAddContractService, 
  useUpdateContractService, 
  useDeleteContractService
} from '@/modules/contracts';
import { useServices } from '@/modules/services';
import { toast } from 'sonner';

interface ContractDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editServiceDialogOpen, setEditServiceDialogOpen] = useState(false);
  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
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
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);

  const { data: contractResponse, isLoading, error } = useContract(contractId);
  const { data: servicesData } = useServices({ active: true });
  const deleteContractMutation = useDeleteContract();
  const addServiceMutation = useAddContractService();
  const updateServiceMutation = useUpdateContractService();
  const deleteServiceMutation = useDeleteContractService();

  const contract = contractResponse?.data;
  const services = servicesData?.data?.services || [];

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Contracts', href: '/super-admin/clients-management/contracts' },
    { label: contract?.contract_number || 'Contract Details' }
  ];

  const handleEdit = () => {
    router.push(`/super-admin/clients-management/contracts/${contractId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contract) return;
    
    try {
      await deleteContractMutation.mutateAsync(contract.id);
      router.push('/super-admin/clients-management/contracts');
    } catch (error) {
      console.error('Failed to delete contract:', error);
    }
  };

  const handleEditService = (service: any) => {
    setCurrentService(service);
    setServiceFormData({
      service_id: service.service_id.toString(),
      quantity: service.quantity.toString(),
      unit_price: service.unit_price.toString(),
      delivery_date: service.delivery_date ? new Date(service.delivery_date).toISOString().split('T')[0] : '',
      description: service.description || '',
      notes: service.notes || ''
    });
    setEditServiceDialogOpen(true);
  };

  const handleDeleteService = (service: any) => {
    setCurrentService(service);
    setDeleteServiceDialogOpen(true);
  };

  const handleAddService = () => {
    setServiceFormData({
      service_id: '',
      quantity: '1',
      unit_price: '',
      delivery_date: '',
      description: '',
      notes: ''
    });
    setAddServiceDialogOpen(true);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      service_id: '',
      quantity: '1',
      unit_price: '',
      delivery_date: '',
      description: '',
      notes: ''
    });
    setCurrentService(null);
  };

  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceFormData.service_id || !serviceFormData.quantity || !serviceFormData.unit_price || !serviceFormData.delivery_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        service_id: parseInt(serviceFormData.service_id),
        quantity: parseInt(serviceFormData.quantity),
        unit_price: parseFloat(serviceFormData.unit_price),
        delivery_date: serviceFormData.delivery_date,
        description: serviceFormData.description || undefined,
        notes: serviceFormData.notes || undefined
      };

      if (currentService) {
        await updateServiceMutation.mutateAsync({
          contractId,
          serviceId: currentService.id,
          data
        });
        setEditServiceDialogOpen(false);
      } else {
        await addServiceMutation.mutateAsync({
          contractId,
          data
        });
        setAddServiceDialogOpen(false);
      }
      
      resetServiceForm();
    } catch (error) {
      console.error('Failed to save service:', error);
    }
  };

  const confirmDeleteService = async () => {
    if (!currentService) return;
    
    try {
      await deleteServiceMutation.mutateAsync({
        contractId,
        serviceId: currentService.id
      });
      setDeleteServiceDialogOpen(false);
      setCurrentService(null);
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  // Helper function to format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !contract) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Contract not found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The contract you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/super-admin/clients-management/contracts')}>
                Back to Contracts
              </Button>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full w-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contract.contract_number}</h1>
                <p className="text-gray-600 dark:text-gray-400">{contract.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <EditIcon className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  onClick={() => router.back()} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 w-full">
                <div className="mb-6">
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                
                <div className="space-y-8">
                  {/* Contract Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                            <div className="mt-1">
                              <Badge className={getStatusColor(contract.status)}>
                                {contract.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {contract.contract_type === 'one_time_project' ? 'One Time Project' : 'Service Subscription'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(contract.start_date)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">End Date</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(contract.end_date)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Signed Date</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(contract.signed_date || undefined)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Currency</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.currency}</p>
                          </div>
                        </div>
                        {contract.description && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</Label>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {parseFloat(contract.total_value).toLocaleString()} {contract.currency}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</Label>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {parseFloat(contract.total_amount).toLocaleString()} {contract.currency}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Advance Payment</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {parseFloat(contract.advance_payment).toLocaleString()} {contract.currency}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Amount</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {parseFloat(contract.remaining_amount).toLocaleString()} {contract.currency}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Terms</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.payment_terms}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Client Information */}
                    {contract.client && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Client Name</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.client.name}</p>
                          </div>
                          {contract.client.company_name && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</Label>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.client.company_name}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.client.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.client.phone}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quotation Information */}
                    {contract.quotation && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Related Quotation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Quotation Number</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.quotation.quotation_number}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.quotation.title}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{contract.quotation.status}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Contract Services */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Contract Services</CardTitle>
                        <Button onClick={handleAddService} className="flex items-center gap-2">
                          <PlusIcon className="h-4 w-4" />
                          Add Service
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {contract.contract_services && contract.contract_services.length > 0 ? (
                        <div className="space-y-4">
                          {contract.contract_services.map((contractService: any) => (
                            <div key={contractService.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {contractService.service?.name || 'Service'}
                                  </h4>
                                  {contractService.service?.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {contractService.service.description}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantity</Label>
                                      <p className="text-sm text-gray-900 dark:text-white">{contractService.quantity}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Unit Price</Label>
                                      <p className="text-sm text-gray-900 dark:text-white">
                                        {parseFloat(contractService.unit_price).toLocaleString()} {contract.currency}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Price</Label>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {parseFloat(contractService.total_price).toLocaleString()} {contract.currency}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Delivery Date</Label>
                                      <p className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(contractService.delivery_date)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditService(contractService)}
                                  >
                                    <EditIcon className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteService(contractService)}
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">No services added to this contract yet.</p>
                          <Button onClick={handleAddService} className="flex items-center gap-2">
                            <PlusIcon className="h-4 w-4" />
                            Add First Service
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes and Terms */}
                  {(contract.notes || contract.terms_conditions) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {contract.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                              {contract.notes}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {contract.terms_conditions && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Terms & Conditions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                              {contract.terms_conditions}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Service Dialog */}
        <Dialog open={addServiceDialogOpen || editServiceDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setAddServiceDialogOpen(false);
            setEditServiceDialogOpen(false);
            resetServiceForm();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentService ? 'Edit Service' : 'Add Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleServiceFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service_id">Service *</Label>
                <Select
                  value={serviceFormData.service_id}
                  onValueChange={(value) => setServiceFormData(prev => ({ ...prev, service_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={serviceFormData.quantity}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceFormData.unit_price}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="delivery_date">Delivery Date *</Label>
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Service description..."
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={serviceFormData.notes}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddServiceDialogOpen(false);
                    setEditServiceDialogOpen(false);
                    resetServiceForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addServiceMutation.isPending || updateServiceMutation.isPending}
                >
                  {(addServiceMutation.isPending || updateServiceMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {currentService ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    currentService ? 'Update Service' : 'Add Service'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Service Dialog */}
        <AlertDialog open={deleteServiceDialogOpen} onOpenChange={setDeleteServiceDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Service</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this service from the contract? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteService}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteServiceMutation.isPending}
              >
                {deleteServiceMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Service'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Contract Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Contract</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this contract? This action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteContractMutation.isPending}
              >
                {deleteContractMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Contract'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
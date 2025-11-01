'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeftIcon, EditIcon, TrashIcon, CalendarIcon, DollarSignIcon, UserIcon, BuildingIcon, PlusIcon } from '@/components/ui/icons';
import { useQuotation, useDeleteQuotation, useUpdateQuotationService, useDeleteQuotationService, useAddQuotationService, useServicesLookup } from '@/modules/quotations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const statusColors: Record<string, string> = {
  sent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

interface QuotationDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuotationDetailsPage({ params }: QuotationDetailsPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editServiceDialogOpen, setEditServiceDialogOpen] = useState(false);
  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({
    service_id: '',
    quantity: '',
    unit_price: '',
    description: '',
    notes: ''
  });
  
  const router = useRouter();
  const resolvedParams = use(params);
  const quotationId = parseInt(resolvedParams.id);

  const { data: quotationResponse, isLoading, error } = useQuotation(quotationId);
  const { data: servicesData } = useServicesLookup();
  const deleteQuotationMutation = useDeleteQuotation();
  const updateServiceMutation = useUpdateQuotationService();
  const deleteServiceMutation = useDeleteQuotationService();
  const addServiceMutation = useAddQuotationService();

  const quotation = quotationResponse?.data;
  const services = servicesData?.data || [];

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Offers', href: '/super-admin/clients-management/offers' },
    { label: quotation?.quotation_number || 'Quotation Details' }
  ];

  const handleEdit = () => {
    router.push(`/super-admin/clients-management/offers/${quotationId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!quotation) return;
    
    try {
      await deleteQuotationMutation.mutateAsync(quotation.id);
      router.push('/super-admin/clients-management/offers');
    } catch (error) {
      console.error('Failed to delete quotation:', error);
    }
  };

  const handleEditService = (service: any) => {
    setCurrentService(service);
    setServiceFormData({
      service_id: service.service_id.toString(),
      quantity: service.quantity.toString(),
      unit_price: service.unit_price,
      description: service.description || '',
      notes: service.notes || ''
    });
    setEditServiceDialogOpen(true);
  };

  const handleDeleteService = (service: any) => {
    setCurrentService(service);
    setDeleteServiceDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!currentService || !quotation) return;

    try {
      await updateServiceMutation.mutateAsync({
        quotationId: quotation.id,
        serviceId: currentService.id,
        data: {
          quantity: parseInt(serviceFormData.quantity),
          unit_price: parseFloat(serviceFormData.unit_price),
          description: serviceFormData.description,
          notes: serviceFormData.notes
        }
      });
      setEditServiceDialogOpen(false);
      setCurrentService(null);
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  const confirmDeleteService = async () => {
    if (!currentService || !quotation) return;

    try {
      await deleteServiceMutation.mutateAsync({
        quotationId: quotation.id,
        serviceId: currentService.id
      });
      setDeleteServiceDialogOpen(false);
      setCurrentService(null);
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleAddService = () => {
    setServiceFormData({
      service_id: '',
      quantity: '',
      unit_price: '',
      description: '',
      notes: ''
    });
    setAddServiceDialogOpen(true);
  };

  const handleAddServiceSubmit = async () => {
    if (!quotation || !serviceFormData.service_id || !serviceFormData.quantity || !serviceFormData.unit_price) return;

    try {
      await addServiceMutation.mutateAsync({
        quotationId: quotation.id,
        data: {
          service_id: parseInt(serviceFormData.service_id),
          quantity: parseInt(serviceFormData.quantity),
          unit_price: parseFloat(serviceFormData.unit_price),
          description: serviceFormData.description,
          notes: serviceFormData.notes
        }
      });
      setAddServiceDialogOpen(false);
      setServiceFormData({
        service_id: '',
        quantity: '',
        unit_price: '',
        description: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading quotation details...</div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !quotation) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading quotation details. Please try again.</div>
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
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quotation.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">Quotation #{quotation.quotation_number}</p>
              </div>
              <div className="flex-shrink-0 ml-6 flex gap-2">
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <EditIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Quotation Number</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{quotation.quotation_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <div className="mt-1">
                          <Badge className={statusColors[quotation.status]}>
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{quotation.currency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meeting ID</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">#{quotation.meeting_id}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                      <p className="text-gray-900 dark:text-white mt-1">{quotation.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSignIcon className="h-5 w-5" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(quotation.subtotal, quotation.currency)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax Rate</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{quotation.tax_rate}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax Amount</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(quotation.tax_amount, quotation.currency)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Rate</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{quotation.discount_rate}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Amount</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(quotation.discount_amount, quotation.currency)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</label>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(quotation.total_amount, quotation.currency)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Terms and Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{quotation.terms_conditions}</p>
                  </CardContent>
                </Card>

                {/* Notes */}
                {quotation.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 dark:text-white">{quotation.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                {/* Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Important Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Until</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(quotation.valid_until)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(quotation.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(quotation.updated_at)}</p>
                    </div>
                    {quotation.sent_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(quotation.sent_date)}</p>
                      </div>
                    )}
                    {quotation.accepted_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(quotation.accepted_date)}</p>
                      </div>
                    )}
                    {quotation.rejected_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(quotation.rejected_date)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Related Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Related Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</label>
                      <p className="text-gray-900 dark:text-white">
                        {quotation.client?.name || quotation.lead?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Employee</label>
                      <p className="text-gray-900 dark:text-white">
                        {quotation.assigned_employee?.name || 'Not assigned'}
                      </p>
                    </div>
                    {quotation.rejection_reason && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</label>
                        <p className="text-gray-900 dark:text-white">{quotation.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Services */}
                {quotation.quotation_services && quotation.quotation_services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Services</span>
                        <Button
                          size="sm"
                          onClick={handleAddService}
                          className="flex items-center gap-2"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Service
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {quotation.quotation_services.map((service, index) => (
                          <div key={service.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {service.service?.name || 'Service'}
                                </h4>
                                {service.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {service.description}
                                  </p>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                    <span className="ml-2 font-medium">{service.quantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                                    <span className="ml-2 font-medium">
                                      {formatCurrency(service.unit_price, quotation.currency)}
                                    </span>
                                  </div>
                                </div>
                                {service.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                    Notes: {service.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(service.total_price, quotation.currency)}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditService(service)}
                                    className="h-8 px-2"
                                  >
                                    <EditIcon className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteService(service)}
                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من أنك تريد حذف العرض &quot;{quotation.title}&quot;؟ 
                    <br />
                    <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteQuotationMutation.isPending}
                  >
                    {deleteQuotationMutation.isPending ? 'جاري الحذف...' : 'حذف العرض'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit Service Dialog */}
            <Dialog open={editServiceDialogOpen} onOpenChange={setEditServiceDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                  <DialogDescription>
                    Update service details for {currentService?.service?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                  <Button variant="outline" onClick={() => setEditServiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateService}
                    disabled={updateServiceMutation.isPending || !serviceFormData.quantity || !serviceFormData.unit_price}
                  >
                    {updateServiceMutation.isPending ? 'Updating...' : 'Update Service'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Service Dialog */}
            <AlertDialog open={deleteServiceDialogOpen} onOpenChange={setDeleteServiceDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Service</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this service? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteService}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteServiceMutation.isPending}
                  >
                    {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete Service'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Add Service Dialog */}
            <Dialog open={addServiceDialogOpen} onOpenChange={setAddServiceDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Service</DialogTitle>
                  <DialogDescription>
                    Add a new service to quotation #{quotation?.quotation_number}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service_id" className="text-right">
                      Service
                    </Label>
                    <Select value={serviceFormData.service_id} onValueChange={(value) => setServiceFormData(prev => ({ ...prev, service_id: value }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - {service.base_price} {service.currency}
                          </SelectItem>
                        ))}
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
                  <Button variant="outline" onClick={() => setAddServiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddServiceSubmit}
                    disabled={addServiceMutation.isPending || !serviceFormData.service_id || !serviceFormData.quantity || !serviceFormData.unit_price}
                  >
                    {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

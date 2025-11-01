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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, MoreVerticalIcon, MailIcon, CheckIcon, XIcon, SettingsIcon } from '@/components/ui/icons';
import { useQuotations, useDeleteQuotation, useSendQuotation, useAcceptQuotation, useRejectQuotation, useModifyQuotation, useServicesLookup, useAddQuotationService } from '@/modules/quotations';
import type { Quotation } from '@/modules/quotations';


const statusColors: Record<string, string> = {
  sent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export default function OffersPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Action modals state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(null);
  
  // Add service modal state
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    service_id: '',
    quantity: '1',
    unit_price: '',
    description: '',
    notes: ''
  });
  
  // Action form data
  const [actionFormData, setActionFormData] = useState({
    notes: '',
    rejection_reason: ''
  });

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Offers' }
  ];

  // Fetch quotations with pagination
  const { data: quotationsResponse, isLoading, error, refetch } = useQuotations({
    page: currentPage,
    per_page: itemsPerPage
  });

  const deleteQuotationMutation = useDeleteQuotation();
  const sendQuotationMutation = useSendQuotation();
  const acceptQuotationMutation = useAcceptQuotation();
  const rejectQuotationMutation = useRejectQuotation();
  const modifyQuotationMutation = useModifyQuotation();
  const addServiceMutation = useAddQuotationService();
  
  // Services lookup
  const { data: servicesData } = useServicesLookup();
  const services = servicesData?.data || [];

  const quotations = quotationsResponse?.data?.quotations || [];
  const meta = quotationsResponse?.meta;

  const handleCreateOffer = () => {
    router.push('/super-admin/clients-management/offers/create');
  };

  const handleViewQuotation = (quotation: Quotation) => {
    router.push(`/super-admin/clients-management/offers/${quotation.id}`);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    router.push(`/super-admin/clients-management/offers/${quotation.id}/edit`);
  };

  const handleDeleteQuotation = (quotation: Quotation) => {
    setQuotationToDelete(quotation);
    setDeleteDialogOpen(true);
  };

  // Action handlers
  const handleActionClick = (action: string, quotation: Quotation) => {
    setCurrentAction(action);
    setCurrentQuotation(quotation);
    setActionFormData({ notes: '', rejection_reason: '' });
    setActionModalOpen(true);
  };

  const handleAddService = (quotation: Quotation) => {
    setCurrentQuotation(quotation);
    setAddServiceModalOpen(true);
  };

  const executeAction = async (actionData?: any) => {
    if (!currentQuotation) return;

    try {
      switch (currentAction) {
        case 'send':
          await sendQuotationMutation.mutateAsync(currentQuotation.id);
          break;
        case 'accept':
          await acceptQuotationMutation.mutateAsync({ 
            quotationId: currentQuotation.id, 
            data: { notes: actionData?.notes || '' } 
          });
          break;
        case 'reject':
          await rejectQuotationMutation.mutateAsync({ 
            quotationId: currentQuotation.id, 
            data: { rejection_reason: actionData?.rejection_reason || '' } 
          });
          break;
        case 'modify':
          await modifyQuotationMutation.mutateAsync({ 
            quotationId: currentQuotation.id, 
            data: { notes: actionData?.notes || '' } 
          });
          break;
      }
      
      // تحديث الصفحة تلقائياً بعد نجاح العملية
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to execute action:', error);
      // Don't reset state on error, let user try again
    }
  };

  const handleAddServiceSubmit = async () => {
    if (!currentQuotation) return;

    try {
      await addServiceMutation.mutateAsync({
        quotationId: currentQuotation.id,
        data: {
          service_id: parseInt(serviceFormData.service_id),
          quantity: parseInt(serviceFormData.quantity),
          unit_price: parseFloat(serviceFormData.unit_price),
          description: serviceFormData.description,
          notes: serviceFormData.notes
        }
      });
      
      // تحديث الصفحة تلقائياً بعد نجاح إضافة الخدمة
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  const confirmDelete = async () => {
    if (!quotationToDelete) return;
    
    try {
      await deleteQuotationMutation.mutateAsync(quotationToDelete.id);
      
      // تحديث الصفحة تلقائياً بعد نجاح الحذف
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      // Error is already handled by the mutation
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Transform quotations data for display
  const transformedQuotations = quotations.map((quotation: Quotation) => ({
    id: quotation.id,
    quotation_number: quotation.quotation_number,
    title: quotation.title,
    customer: quotation.client?.name || quotation.lead?.name || '-',
    related_meeting: `Meeting #${quotation.meeting_id}`,
    total_amount: `${quotation.currency} ${parseFloat(quotation.subtotal).toLocaleString()}`,
    final_amount: `${quotation.currency} ${parseFloat(quotation.total_amount).toLocaleString()}`,
    status: quotation.status,
    valid_until: quotation.valid_until,
    created_at: quotation.created_at
  }));

  // Define table columns
  const columns: Column[] = [
    { key: 'quotation_number', label: 'Quotation No.', type: 'text', align: 'right' },
    { key: 'title', label: 'Quotation Title', type: 'text', align: 'right' },
    { key: 'customer', label: 'Customer', type: 'text', align: 'right' },
    { key: 'related_meeting', label: 'Related Meeting', type: 'text', align: 'right' },
    { key: 'total_amount', label: 'Total Amount', type: 'text', align: 'right' },
    { key: 'final_amount', label: 'Final Amount', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'badge', badgeColors: statusColors, align: 'center' },
    { key: 'valid_until', label: 'Valid Until', type: 'date', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];


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
          label: 'View Offer',
          onClick: handleViewQuotation
        },
        {
          icon: EditIcon,
          label: 'Edit Offer',
          onClick: handleEditQuotation
        },
        {
          icon: PlusIcon,
          label: 'Add Services',
          onClick: handleAddService
        },
        {
          icon: MailIcon,
          label: 'Send Quotation',
          onClick: (quotation: Quotation) => handleActionClick('send', quotation),
          className: 'text-orange-600 dark:text-orange-400'
        },
        {
          icon: CheckIcon,
          label: 'Accept Quotation',
          onClick: (quotation: Quotation) => handleActionClick('accept', quotation),
          className: 'text-green-600 dark:text-green-400'
        },
        {
          icon: XIcon,
          label: 'Reject Quotation',
          onClick: (quotation: Quotation) => handleActionClick('reject', quotation),
          className: 'text-red-600 dark:text-red-400'
        },
        {
          icon: SettingsIcon,
          label: 'Request Modification',
          onClick: (quotation: Quotation) => handleActionClick('modify', quotation),
          className: 'text-yellow-600 dark:text-yellow-400'
        },
        {
          icon: TrashIcon,
          label: 'Delete Offer',
          onClick: handleDeleteQuotation,
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

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading quotations...</div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading quotations. Please try again.</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Create and manage customer offers</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button onClick={handleCreateOffer} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Offer</span>
                </Button>
              </div>
            </div>

            {/* Pagination Info */}
            {meta && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {quotations.length} of {meta.total} quotations • Page {meta.current_page} of {meta.last_page}
              </div>
            )}

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              <DataTable
                data={transformedQuotations}
                columns={columns}
                actions={actions}
                searchable={true}
                searchPlaceholder="Search offers..."
                filterable={false}
                selectable={true}
                serverSide={true}
                currentPage={meta?.current_page || 1}
                totalPages={meta?.last_page || 1}
                totalItems={meta?.total || 0}
                itemsPerPage={itemsPerPage}
                itemsPerPageOptions={[5, 10, 15]}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onSelectionChange={handleSelectionChange}
                onSearch={handleSearch}
                onFilter={handleFilter}
                className="flex-1 flex flex-col min-h-0"
              />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من أنك تريد حذف العرض &quot;{quotationToDelete?.title}&quot;؟ 
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

            {/* Action Modal */}
            <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {currentAction === 'send' && 'Send Quotation'}
                    {currentAction === 'accept' && 'Accept Quotation'}
                    {currentAction === 'reject' && 'Reject Quotation'}
                    {currentAction === 'modify' && 'Request Modification'}
                  </DialogTitle>
                  <DialogDescription>
                    {currentAction === 'send' && 'Are you sure you want to send this quotation to the client?'}
                    {currentAction === 'accept' && 'Accept this quotation and add any notes if needed.'}
                    {currentAction === 'reject' && 'Reject this quotation and provide a reason.'}
                    {currentAction === 'modify' && 'Request modifications to this quotation.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {(currentAction === 'accept' || currentAction === 'modify') && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter notes..."
                        className="col-span-3"
                        value={actionFormData.notes}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  )}
                  {currentAction === 'reject' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rejection_reason" className="text-right">
                        Reason
                      </Label>
                      <Textarea
                        id="rejection_reason"
                        placeholder="Enter rejection reason..."
                        className="col-span-3"
                        value={actionFormData.rejection_reason}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActionModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => executeAction({ 
                      notes: currentAction === 'accept' || currentAction === 'modify' ? actionFormData.notes : undefined,
                      rejection_reason: currentAction === 'reject' ? actionFormData.rejection_reason : undefined
                    })}
                    disabled={
                      sendQuotationMutation.isPending ||
                      acceptQuotationMutation.isPending ||
                      rejectQuotationMutation.isPending ||
                      modifyQuotationMutation.isPending
                    }
                  >
                    {sendQuotationMutation.isPending || acceptQuotationMutation.isPending || 
                     rejectQuotationMutation.isPending || modifyQuotationMutation.isPending
                      ? 'Processing...' 
                      : 'Confirm'
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Service Modal */}
            <Dialog open={addServiceModalOpen} onOpenChange={setAddServiceModalOpen}>
              <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Add Service</DialogTitle>
                  <DialogDescription>
                    Add a new service to quotation #{currentQuotation?.quotation_number}
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
                  <Button variant="outline" onClick={() => setAddServiceModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddServiceSubmit}
                    disabled={addServiceMutation.isPending || !serviceFormData.service_id || !serviceFormData.unit_price}
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
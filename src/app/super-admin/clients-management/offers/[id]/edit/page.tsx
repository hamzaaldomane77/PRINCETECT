'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon, CalendarIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useQuotation, useUpdateQuotation, useLeadsLookup, useClientsLookup, useEmployeesLookup, useCurrenciesLookup, useStatusesLookup, useUpdateQuotationService, useDeleteQuotationService, useAddQuotationService, useServicesLookup } from '@/modules/quotations';
import type { UpdateQuotationRequest } from '@/modules/quotations';

interface EditQuotationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditQuotationPage({ params }: EditQuotationPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const quotationId = parseInt(resolvedParams.id);

  const { data: quotationResponse, isLoading, error } = useQuotation(quotationId);
  const updateQuotationMutation = useUpdateQuotation();
  const updateServiceMutation = useUpdateQuotationService();
  const deleteServiceMutation = useDeleteQuotationService();
  const addServiceMutation = useAddQuotationService();
  
  // Lookup data
  const { data: leadsData } = useLeadsLookup();
  const { data: clientsData } = useClientsLookup();
  const { data: employeesData } = useEmployeesLookup();
  const { data: currenciesData } = useCurrenciesLookup();
  const { data: statusesData } = useStatusesLookup();
  const { data: servicesData } = useServicesLookup();
  
  const leads = leadsData?.data || [];
  const clients = clientsData?.data || [];
  const employees = employeesData?.data || [];
  const currencies = currenciesData?.data || [];
  const statuses = statusesData?.data || [];
  const services = servicesData?.data || [];

  const quotation = quotationResponse?.data;

  // Service management state
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

  const [formData, setFormData] = useState({
    quotation_number: '',
    title: '',
    description: '',
    subtotal: '',
    tax_rate: '',
    tax_amount: '',
    discount_rate: '',
    discount_amount: '',
    total_amount: '',
    currency: 'SAR',
    valid_until: '',
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected' | 'modified',
    notes: '',
    terms_conditions: '',
    lead_id: '',
    client_id: '',
    assigned_to: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calendar state
  const [validUntilOpen, setValidUntilOpen] = useState(false);
  const [validUntilCaptionLayout, setValidUntilCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years" | "label">("label");

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Offers', href: '/super-admin/clients-management/offers' },
    { label: quotation?.quotation_number || 'Edit Quotation', href: `/super-admin/clients-management/offers/${quotationId}` },
    { label: 'Edit' }
  ];

  // Populate form data when quotation is loaded
  useEffect(() => {
    if (quotation) {
      setFormData({
        quotation_number: quotation.quotation_number || '',
        title: quotation.title || '',
        description: quotation.description || '',
        subtotal: quotation.subtotal || '',
        tax_rate: quotation.tax_rate || '',
        tax_amount: quotation.tax_amount || '',
        discount_rate: quotation.discount_rate || '',
        discount_amount: quotation.discount_amount || '',
        total_amount: quotation.total_amount || '',
        currency: quotation.currency || 'SAR',
        valid_until: quotation.valid_until ? quotation.valid_until.split('T')[0] : '',
        status: quotation.status || 'draft',
        notes: quotation.notes || '',
        terms_conditions: quotation.terms_conditions || '',
        lead_id: quotation.lead_id?.toString() || '',
        client_id: quotation.client_id?.toString() || '',
        assigned_to: quotation.assigned_to?.toString() || ''
      });
    }
  }, [quotation]);

  const handleInputChange = (field: string, value: string) => {
    // Convert "none" to empty string for API
    const processedValue = value === 'none' ? '' : value;
    
    setFormData(prev => {
      const newData = {
      ...prev,
      [field]: processedValue
      };
      
      // Auto-calculate tax amount when subtotal or tax rate changes
      if (field === 'subtotal' || field === 'tax_rate') {
        const subtotal = parseFloat(newData.subtotal) || 0;
        const taxRate = parseFloat(newData.tax_rate) || 0;
        newData.tax_amount = (subtotal * taxRate / 100).toFixed(2);
      }
      
      // Auto-calculate discount amount when subtotal or discount rate changes
      if (field === 'subtotal' || field === 'discount_rate') {
        const subtotal = parseFloat(newData.subtotal) || 0;
        const discountRate = parseFloat(newData.discount_rate) || 0;
        newData.discount_amount = (subtotal * discountRate / 100).toFixed(2);
      }
      
      // Auto-calculate total amount when any financial field changes
      if (['subtotal', 'tax_rate', 'tax_amount', 'discount_rate', 'discount_amount'].includes(field)) {
        const subtotal = parseFloat(newData.subtotal) || 0;
        const taxAmount = parseFloat(newData.tax_amount) || 0;
        const discountAmount = parseFloat(newData.discount_amount) || 0;
        newData.total_amount = (subtotal + taxAmount - discountAmount).toFixed(2);
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
  const handleDateSelect = (field: 'valid_until', date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date); // Use local date without timezone conversion
      handleInputChange(field, formattedDate);
    }
    setValidUntilOpen(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quotation_number.trim()) {
      newErrors.quotation_number = 'Quotation number is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.subtotal && parseFloat(formData.subtotal) < 0) {
      newErrors.subtotal = 'Subtotal must be 0 or greater';
    }

    if (formData.tax_rate && (parseFloat(formData.tax_rate) < 0 || parseFloat(formData.tax_rate) > 100)) {
      newErrors.tax_rate = 'Tax rate must be between 0 and 100';
    }

    if (formData.discount_rate && (parseFloat(formData.discount_rate) < 0 || parseFloat(formData.discount_rate) > 100)) {
      newErrors.discount_rate = 'Discount rate must be between 0 and 100';
    }

    if (formData.valid_until && new Date(formData.valid_until) <= new Date()) {
      newErrors.valid_until = 'Valid until date must be after today';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData: UpdateQuotationRequest = {
      id: quotationId,
      quotation_number: formData.quotation_number,
      title: formData.title,
      description: formData.description,
      subtotal: formData.subtotal ? parseFloat(formData.subtotal) : 0,
      tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : 0,
      tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : 0,
      discount_rate: formData.discount_rate ? parseFloat(formData.discount_rate) : 0,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : 0,
      total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
      currency: formData.currency,
      valid_until: formData.valid_until,
      status: formData.status,
      notes: formData.notes,
      terms_conditions: formData.terms_conditions,
      // Keep original lead_id and client_id from quotation (read-only fields)
      lead_id: quotation?.lead_id || null,
      client_id: quotation?.client_id || null,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
    };

    try {
      await updateQuotationMutation.mutateAsync(updateData);
      router.push(`/super-admin/clients-management/offers/${quotationId}`);
    } catch (error) {
      console.error('Failed to update quotation:', error);
    }
  };

  // Service management handlers
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Quotation</h1>
                <p className="text-gray-600 dark:text-gray-400">Update quotation #{quotation.quotation_number}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update the basic details of the quotation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="quotation_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quotation Number *
                      </Label>
                      <Input
                        id="quotation_number"
                        value={formData.quotation_number}
                        onChange={(e) => handleInputChange('quotation_number', e.target.value)}
                        className={`mt-1 ${errors.quotation_number ? 'border-red-500' : ''}`}
                        placeholder="Enter quotation number"
                      />
                      {errors.quotation_number && <p className="text-red-500 text-sm mt-1">{errors.quotation_number}</p>}
                    </div>

                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                        placeholder="Enter quotation title"
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="mt-1"
                        placeholder="Enter quotation description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  status.value === 'draft' ? 'bg-gray-400' :
                                  status.value === 'sent' ? 'bg-yellow-400' :
                                  status.value === 'accepted' ? 'bg-green-400' :
                                  status.value === 'rejected' ? 'bg-red-400' :
                                  status.value === 'modified' ? 'bg-blue-400' : 'bg-gray-400'
                                }`} />
                                {status.value.charAt(0).toUpperCase() + status.value.slice(1)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Currency
                      </Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {currency.value === 'SAR' ? '🇸🇦' :
                                   currency.value === 'USD' ? '🇺🇸' :
                                   currency.value === 'EUR' ? '🇪🇺' :
                                   currency.value === 'AED' ? '🇦🇪' :
                                   currency.value === 'KWD' ? '🇰🇼' : '💰'}
                                </span>
                                <span>{currency.label}</span>
                                <span className="text-gray-500 text-sm">({currency.value})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                    <CardDescription>Update pricing and financial details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="subtotal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subtotal
                      </Label>
                      <div className="relative mt-1">
                      <Input
                        id="subtotal"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.subtotal}
                        onChange={(e) => handleInputChange('subtotal', e.target.value)}
                          className={`pr-12 ${errors.subtotal ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                      />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 text-sm">{formData.currency}</span>
                        </div>
                      </div>
                      {errors.subtotal && <p className="text-red-500 text-sm mt-1">{errors.subtotal}</p>}
                    </div>

                    <div>
                      <Label htmlFor="tax_rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Rate (%)
                      </Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.tax_rate}
                        onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                        className={`mt-1 ${errors.tax_rate ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.tax_rate && <p className="text-red-500 text-sm mt-1">{errors.tax_rate}</p>}
                    </div>

                    <div>
                      <Label htmlFor="tax_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Amount
                      </Label>
                      <div className="relative mt-1">
                      <Input
                        id="tax_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.tax_amount}
                        onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                          className="pr-12"
                        placeholder="0.00"
                      />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 text-sm">{formData.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="discount_rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Rate (%)
                      </Label>
                      <Input
                        id="discount_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.discount_rate}
                        onChange={(e) => handleInputChange('discount_rate', e.target.value)}
                        className={`mt-1 ${errors.discount_rate ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.discount_rate && <p className="text-red-500 text-sm mt-1">{errors.discount_rate}</p>}
                    </div>

                    <div>
                      <Label htmlFor="discount_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Amount
                      </Label>
                      <div className="relative mt-1">
                      <Input
                        id="discount_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discount_amount}
                        onChange={(e) => handleInputChange('discount_amount', e.target.value)}
                          className="pr-12"
                        placeholder="0.00"
                      />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 text-sm">{formData.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="total_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Amount
                      </Label>
                      <div className="relative mt-1">
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.total_amount}
                        onChange={(e) => handleInputChange('total_amount', e.target.value)}
                          className="pr-12 font-bold"
                        placeholder="0.00"
                      />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 text-sm font-bold">{formData.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valid_until" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valid Until
                      </Label>
                      <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal h-11 ${
                              !formData.valid_until && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.valid_until ? formatDate(formData.valid_until) : 'Select valid until date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3">
                            <Calendar
                              mode="single"
                              selected={formData.valid_until ? new Date(formData.valid_until) : undefined}
                              onSelect={(date) => handleDateSelect('valid_until', date)}
                              disabled={(date) => date < new Date()}
                              captionLayout={validUntilCaptionLayout}
                              initialFocus
                            />
                            <div className="mt-3 flex flex-col gap-3">
                              <Label htmlFor="valid-until-dropdown" className="px-1 text-sm">
                                Date Selection Mode
                              </Label>
                              <Select
                                value={validUntilCaptionLayout}
                                onValueChange={(value) =>
                                  setValidUntilCaptionLayout(
                                    value as "dropdown" | "dropdown-months" | "dropdown-years"
                                  )
                                }
                              >
                                <SelectTrigger
                                  id="valid-until-dropdown"
                                  size="sm"
                                  className="bg-background w-full"
                                >
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent align="center">
                                  <SelectItem value="dropdown">Month and Year</SelectItem>
                                  <SelectItem value="dropdown-months">Month Only</SelectItem>
                                  <SelectItem value="dropdown-years">Year Only</SelectItem>
                                  <SelectItem value="label">Full Calendar View</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {/* Year Counter for Full Calendar View */}
                              {validUntilCaptionLayout === "label" && (
                                <div className="flex flex-col gap-2">
                                  <Label htmlFor="year-select" className="px-1 text-sm">
                                    Quick Year Selection
                                  </Label>
                                  <Select
                                    value={formData.valid_until ? new Date(formData.valid_until).getFullYear().toString() : new Date().getFullYear().toString()}
                                    onValueChange={(year) => {
                                      const currentDate = formData.valid_until ? new Date(formData.valid_until) : new Date();
                                      const newDate = new Date(currentDate);
                                      newDate.setFullYear(parseInt(year));
                                      handleDateSelect('valid_until', newDate);
                                    }}
                                  >
                                    <SelectTrigger id="year-select" size="sm" className="bg-background w-full">
                                      <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent align="center">
                                      {Array.from({ length: 10 }, (_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return (
                                          <SelectItem key={year} value={year.toString()}>
                                            {year}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {errors.valid_until && <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Terms, conditions, and other details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="terms_conditions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Terms and Conditions
                    </Label>
                    <Textarea
                      id="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                      className="mt-1"
                      placeholder="Enter terms and conditions"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="mt-1"
                      placeholder="Enter additional notes"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lead_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lead (Read Only)
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {quotation?.lead ? `${quotation.lead.name} - ${quotation.lead.company_name}` : 'No lead assigned'}
                            </p>
                            {quotation?.lead && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Email: {quotation.lead.email} | Phone: {quotation.lead.phone}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {quotation?.lead_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client (Read Only)
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {quotation?.client ? `${quotation.client.name} - ${quotation.client.company_name}` : 'No client assigned'}
                            </p>
                            {quotation?.client && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Email: {quotation.client.email} | Phone: {quotation.client.phone}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {quotation?.client_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assigned Employee
                      </Label>
                      <Select value={formData.assigned_to || 'none'} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No employee assigned</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.name} ({employee.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateQuotationMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  <span>{updateQuotationMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </form>

            {/* Services Section */}
            {quotation?.quotation_services && quotation.quotation_services.length > 0 && (
              <Card className="mt-6">
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
                                  {quotation.currency} {parseFloat(service.unit_price).toLocaleString()}
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
                              {quotation.currency} {parseFloat(service.total_price).toLocaleString()}
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

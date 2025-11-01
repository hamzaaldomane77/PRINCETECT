'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeftIcon, PlusIcon, CalendarIcon } from '@/components/ui/icons';
import { useCreateContract, useLeadsLookup, useClientsLookup, useQuotationsLookup, useEmployeesLookup, useStatusesLookup, usePaymentTermsLookup } from '@/modules/contracts';
import { CreateContractRequest } from '@/modules/contracts/types';
import { toast } from 'sonner';

export default function CreateContractPage() {
  const router = useRouter();
  const createContractMutation = useCreateContract();

  // Fetch lookup data
  const { data: leadsData } = useLeadsLookup();
  const { data: clientsData } = useClientsLookup();
  const { data: quotationsData } = useQuotationsLookup();
  const { data: employeesData } = useEmployeesLookup();
  const { data: statusesData } = useStatusesLookup();
  const { data: paymentTermsData } = usePaymentTermsLookup();

  const leads = leadsData?.data || [];
  const clients = clientsData?.data || [];
  const quotations = quotationsData?.data || [];
  const employees = employeesData?.data || [];
  const statuses = statusesData?.data || [];
  const paymentTerms = paymentTermsData?.data || [];

  const [formData, setFormData] = useState<CreateContractRequest>({
    quotation_id: null,
    lead_id: null,
    client_id: null,
    contract_number: '',
    title: '',
    description: null,
    start_date: '',
    end_date: '',
    contract_type: 'one_time_project',
    total_value: 0,
    total_amount: 0,
    advance_payment: 0,
    remaining_amount: 0,
    currency: 'USD',
    payment_terms: 'upfront',
    payment_schedule: [] as string[] | null,
    status: 'active',
    signed_date: null,
    cancelled_date: null,
    cancellation_reason: null,
    notes: null,
    terms_conditions: null,
    assigned_to: null,
    project_manager: null,
    is_active: false,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Calendar state
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [signedDateOpen, setSignedDateOpen] = useState(false);
  const [cancelledDateOpen, setCancelledDateOpen] = useState(false);
  
  // Payment schedule state
  const [paymentScheduleItems, setPaymentScheduleItems] = useState<string[]>([]);
  const [newPaymentItem, setNewPaymentItem] = useState('');

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Contracts', href: '/super-admin/clients-management/contracts' },
    { label: 'Create New Contract' }
  ];

  const handleInputChange = (field: keyof CreateContractRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
  const handleDateSelect = (field: 'start_date' | 'end_date' | 'signed_date' | 'cancelled_date', date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date); // Use local date without timezone conversion
      handleInputChange(field, formattedDate);
    }
    if (field === 'start_date') setStartDateOpen(false);
    if (field === 'end_date') setEndDateOpen(false);
    if (field === 'signed_date') setSignedDateOpen(false);
    if (field === 'cancelled_date') setCancelledDateOpen(false);
  };

  // Calculate remaining amount when advance payment changes
  const handleAdvancePaymentChange = (value: string) => {
    const advancePayment = parseFloat(value) || 0;
    const remainingAmount = formData.total_amount - advancePayment;
    
    setFormData(prev => ({
      ...prev,
      advance_payment: advancePayment,
      remaining_amount: Math.max(0, remainingAmount)
    }));
  };

  // Payment schedule management
  const addPaymentScheduleItem = () => {
    if (newPaymentItem.trim()) {
      const updatedItems = [...paymentScheduleItems, newPaymentItem.trim()];
      setPaymentScheduleItems(updatedItems);
      setFormData(prev => ({ ...prev, payment_schedule: updatedItems.length > 0 ? updatedItems : null }));
      setNewPaymentItem('');
    }
  };

  const removePaymentScheduleItem = (index: number) => {
    const updatedItems = paymentScheduleItems.filter((_, i) => i !== index);
    setPaymentScheduleItems(updatedItems);
    setFormData(prev => ({ ...prev, payment_schedule: updatedItems.length > 0 ? updatedItems : null }));
  };

  // Auto-fill data when quotation is selected
  const handleQuotationChange = (quotationId: string) => {
    const quotation = quotations.find(q => q.id.toString() === quotationId);
    if (quotation) {
      setFormData(prev => ({
        ...prev,
        quotation_id: parseInt(quotationId),
        client_id: quotation.client_id,
        lead_id: quotation.lead_id,
        total_amount: parseFloat(quotation.total_amount || '0'),
        total_value: parseFloat(quotation.total_amount || '0'),
        advance_payment: 0,
        remaining_amount: parseFloat(quotation.total_amount || '0'),
        title: quotation.title || prev.title
      }));
    }
  };

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Required field validations
    if (!formData.contract_number.trim()) {
      newErrors.contract_number = ['Contract number is required'];
    }

    if (!formData.title.trim()) {
      newErrors.title = ['Contract title is required'];
    }

    if (!formData.start_date) {
      newErrors.start_date = ['Start date is required'];
    }

    if (!formData.end_date) {
      newErrors.end_date = ['End date is required'];
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = ['End date must be after start date'];
    }

    if (formData.total_amount <= 0) {
      newErrors.total_amount = ['Total amount must be greater than 0'];
    }

    if (formData.advance_payment < 0) {
      newErrors.advance_payment = ['Advance payment cannot be negative'];
    }

    if (formData.advance_payment > formData.total_amount) {
      newErrors.advance_payment = ['Advance payment cannot exceed total amount'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        element.focus();
      }
    }
  };

  // Helper function to render error messages for a field
  const renderFieldErrors = (fieldName: string) => {
    const fieldErrors = errors[fieldName];
    if (!fieldErrors || fieldErrors.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {fieldErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="block w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
            {error}
          </p>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Validate form
    if (!validateForm()) {
      setIsValidating(false);
      toast.error('Please fix the errors below');
      // Scroll to first error after a short delay to ensure errors are rendered
      setTimeout(scrollToError, 100);
      return;
    }

    try {
      // Create a clean copy with only meaningful values
      const cleanedData = { ...formData };
      
      // Convert empty strings to null for optional fields
      const cleanedDataCopy = { ...cleanedData };
      Object.keys(cleanedDataCopy).forEach(key => {
        const value = cleanedDataCopy[key as keyof typeof cleanedDataCopy];
        if (value === '') {
          (cleanedDataCopy as any)[key] = null;
        }
      });

      await createContractMutation.mutateAsync(cleanedDataCopy);
      toast.success('Contract created successfully!');
      router.push('/super-admin/clients-management/contracts');
    } catch (error) {
      console.error('Failed to create contract:', error);
      
      // Handle API validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data?.errors) {
          // Server-side validation errors - keep all error messages
          const serverErrors: Record<string, string[]> = {};
          Object.keys(apiError.response.data.errors).forEach(field => {
            const fieldErrors = apiError.response.data.errors[field];
            serverErrors[field] = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
          });
          setErrors(serverErrors);
          setTimeout(scrollToError, 100);
          
          // Show detailed error message
          const errorCount = Object.keys(serverErrors).length;
          const totalErrors = Object.values(serverErrors).reduce((acc, errors) => acc + errors.length, 0);
          toast.error(`Found ${totalErrors} validation error${totalErrors > 1 ? 's' : ''} in ${errorCount} field${errorCount > 1 ? 's' : ''}. Please check the form below.`);
          setIsValidating(false);
          return;
        }
      }

      const errorMessage = (error as Error)?.message || 'Failed to create contract. Please try again.';
      toast.error(errorMessage);
      setIsValidating(false);
    }
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
         <div className="h-full w-full bg-white dark:bg-gray-900">
           <div className="h-full flex flex-col">
            {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Contract</h1>
                 <p className="text-gray-600 dark:text-gray-400">Add a new contract to the system</p>
              </div>
              <Button
                 onClick={() => router.back()} 
                variant="outline"
                 className="flex items-center gap-2"
              >
                 <ArrowLeftIcon className="h-4 w-4" />
                 Back
              </Button>
            </div>

             {/* Form */}
             <div className="flex-1 overflow-auto">
               <div className="p-6 w-full">
                 <div className="mb-6">
                   <Breadcrumb items={breadcrumbItems} />
                </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-none">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Basic Information
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter the basic contract information
                      </p>
              </div>
              
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contract Number */}
                      <div className="space-y-2">
                        <Label htmlFor="contract_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contract Number *
                        </Label>
                        <Input
                          id="contract_number"
                          value={formData.contract_number}
                          onChange={(e) => handleInputChange('contract_number', e.target.value)}
                          placeholder="e.g., CNT-2025-001"
                          required
                          className={`h-11 ${errors.contract_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('contract_number')}
            </div>

                      {/* Contract Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contract Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter contract title"
                          required
                          className={`h-11 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('title')}
                      </div>

                      {/* Quotation */}
                      <div className="space-y-2">
                        <Label htmlFor="quotation_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Related Quotation
                        </Label>
                        <Select
                          value={formData.quotation_id ? formData.quotation_id.toString() : ''}
                          onValueChange={handleQuotationChange}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select quotation (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {quotations.map((quotation) => (
                              <SelectItem key={quotation.id} value={quotation.id.toString()}>
                                {quotation.quotation_number} - {quotation.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Client */}
                      <div className="space-y-2">
                        <Label htmlFor="client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client
                        </Label>
                        <Select
                          value={formData.client_id ? formData.client_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('client_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select client (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name} {client.company_name && `- ${client.company_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lead */}
                      <div className="space-y-2">
                        <Label htmlFor="lead_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lead
                        </Label>
                        <Select
                          value={formData.lead_id ? formData.lead_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('lead_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select lead (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {leads.map((lead) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.name} {lead.company_name && `- ${lead.company_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Currency */}
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Currency
                        </Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange('currency', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="SAR">SAR</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value || null)}
                        placeholder="Enter contract description"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Contract Dates Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Dates</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Set contract timeline</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date *
                        </Label>
                        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal h-11 ${
                                !formData.start_date && 'text-muted-foreground'
                              } ${errors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.start_date ? formatDate(formData.start_date) : 'Select start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.start_date ? new Date(formData.start_date) : undefined}
                              onSelect={(date) => handleDateSelect('start_date', date)}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {renderFieldErrors('start_date')}
                      </div>

                      {/* End Date */}
                      <div className="space-y-2">
                        <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date *
                        </Label>
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal h-11 ${
                                !formData.end_date && 'text-muted-foreground'
                              } ${errors.end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.end_date ? formatDate(formData.end_date) : 'Select end date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.end_date ? new Date(formData.end_date) : undefined}
                              onSelect={(date) => handleDateSelect('end_date', date)}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {renderFieldErrors('end_date')}
                      </div>

                      {/* Signed Date */}
                      <div className="space-y-2">
                        <Label htmlFor="signed_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Signed Date
                        </Label>
                        <Popover open={signedDateOpen} onOpenChange={setSignedDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal h-11 ${
                                !formData.signed_date && 'text-muted-foreground'
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.signed_date ? formatDate(formData.signed_date) : 'Select signed date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.signed_date ? new Date(formData.signed_date) : undefined}
                              onSelect={(date) => handleDateSelect('signed_date', date)}
                              disabled={(date) => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Contract Type */}
                      <div className="space-y-2">
                        <Label htmlFor="contract_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contract Type
                        </Label>
                        <Select
                          value={formData.contract_type || 'one_time_project'}
                          onValueChange={(value) => handleInputChange('contract_type', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one_time_project">One Time Project</SelectItem>
                            <SelectItem value="service_subscription">Service Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Set contract financial details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Total Value */}
                      <div className="space-y-2">
                        <Label htmlFor="total_value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Value
                        </Label>
                        <Input
                          id="total_value"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.total_value || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleInputChange('total_value', value);
                            handleInputChange('total_amount', value);
                            handleInputChange('remaining_amount', value - formData.advance_payment);
                          }}
                          placeholder="Enter total value"
                          className={`h-11 ${errors.total_value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('total_value')}
                      </div>

                      {/* Total Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="total_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Amount *
                        </Label>
                        <Input
                          id="total_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.total_amount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleInputChange('total_amount', value);
                            handleInputChange('remaining_amount', value - formData.advance_payment);
                          }}
                          placeholder="Enter total amount"
                          required
                          className={`h-11 ${errors.total_amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('total_amount')}
                      </div>

                      {/* Advance Payment */}
                      <div className="space-y-2">
                        <Label htmlFor="advance_payment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Advance Payment
                        </Label>
                        <Input
                          id="advance_payment"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.advance_payment || ''}
                          onChange={(e) => handleAdvancePaymentChange(e.target.value)}
                          placeholder="Enter advance payment"
                          className={`h-11 ${errors.advance_payment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('advance_payment')}
                      </div>

                      {/* Remaining Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="remaining_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Remaining Amount
                        </Label>
                        <Input
                          id="remaining_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.remaining_amount || ''}
                          readOnly
                          className="h-11 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>

                      {/* Payment Terms */}
                      <div className="space-y-2">
                        <Label htmlFor="payment_terms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Terms
                        </Label>
                        <Select
                          value={formData.payment_terms}
                          onValueChange={(value) => handleInputChange('payment_terms', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentTerms.map((term) => (
                              <SelectItem key={term.value} value={term.value}>
                                {term.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Schedule */}
                      <div className="space-y-2">
                        <Label htmlFor="payment_schedule" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Schedule
                        </Label>
                        <div className="space-y-3">
                          {/* Add new payment schedule item */}
                          <div className="flex gap-2">
                            <Input
                              value={newPaymentItem}
                              onChange={(e) => setNewPaymentItem(e.target.value)}
                              placeholder="e.g., Monthly, Quarterly, Upon completion, etc."
                              className="h-11 flex-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addPaymentScheduleItem();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={addPaymentScheduleItem}
                              disabled={!newPaymentItem.trim()}
                              className="h-11 px-4"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Display payment schedule items */}
                          {paymentScheduleItems.length > 0 && (
                            <div className="space-y-2">
                              {paymentScheduleItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePaymentScheduleItem(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contract Management Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Management</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Assign and manage contract details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange('status', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Assigned To */}
                      <div className="space-y-2">
                        <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Assigned To
                        </Label>
                        <Select
                          value={formData.assigned_to ? formData.assigned_to.toString() : ''}
                          onValueChange={(value) => handleInputChange('assigned_to', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} ({employee.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Project Manager */}
                      <div className="space-y-2">
                        <Label htmlFor="project_manager" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Project Manager
                        </Label>
                        <Select
                          value={formData.project_manager ? formData.project_manager.toString() : ''}
                          onValueChange={(value) => handleInputChange('project_manager', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select project manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} ({employee.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                      <Label htmlFor="terms_conditions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Terms & Conditions
                      </Label>
                      <Textarea
                        id="terms_conditions"
                        value={formData.terms_conditions || ''}
                        onChange={(e) => handleInputChange('terms_conditions', e.target.value || null)}
                        placeholder="Enter contract terms and conditions"
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value || null)}
                        placeholder="Enter any additional notes..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active Status
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enable or disable the contract
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Switch
                          id="is_active"
                          checked={formData.is_active || false}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        {renderFieldErrors('is_active')}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={createContractMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                        <Button
                      type="submit"
                      disabled={createContractMutation.isPending || isValidating}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(createContractMutation.isPending || isValidating) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isValidating ? 'Validating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Contract
                        </>
                      )}
                    </Button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

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
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, SaveIcon, PlusIcon } from '@/components/ui/icons';
import { useContract, useUpdateContract, useLeadsLookup, useClientsLookup, useQuotationsLookup, useEmployeesLookup, useStatusesLookup, usePaymentTermsLookup } from '@/modules/contracts';
import { UpdateContractRequest } from '@/modules/contracts/types';
import { toast } from 'sonner';

interface EditContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditContractPage({ params }: EditContractPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateContractRequest>({
    quotation_id: null,
    lead_id: null,
    client_id: null,
    contract_number: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    contract_type: 'one_time_project',
    total_value: 0,
    total_amount: 0,
    advance_payment: 0,
    remaining_amount: 0,
    currency: 'USD',
    payment_terms: 'upfront',
    payment_schedule: [],
    status: 'active',
    signed_date: null,
    cancelled_date: null,
    cancellation_reason: '',
    notes: '',
    terms_conditions: '',
    assigned_to: null,
    project_manager: null,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  // Payment schedule state
  const [paymentScheduleItems, setPaymentScheduleItems] = useState<string[]>([]);
  const [newPaymentItem, setNewPaymentItem] = useState('');

  // Fetch contract data and lookup data
  const { data: contractResponse, isLoading, error } = useContract(contractId);
  const updateContractMutation = useUpdateContract();
  
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

  const contract = contractResponse?.data;

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Contracts', href: '/super-admin/clients-management/contracts' },
    { label: contract?.title || 'Edit Contract' }
  ];

  // Populate form when contract data is loaded
  useEffect(() => {
    if (contract) {
      setFormData({
        quotation_id: contract.quotation_id,
        lead_id: contract.lead_id,
        client_id: contract.client_id,
        contract_number: contract.contract_number,
        title: contract.title,
        description: contract.description || '',
        start_date: contract.start_date.split('T')[0], // Convert to date input format
        end_date: contract.end_date.split('T')[0],
        contract_type: 'one_time_project', // Default value since it's not in the API response
        total_value: parseFloat(contract.total_value),
        total_amount: parseFloat(contract.total_amount),
        advance_payment: parseFloat(contract.advance_payment),
        remaining_amount: parseFloat(contract.remaining_amount),
        currency: contract.currency,
        payment_terms: contract.payment_terms,
        payment_schedule: Array.isArray(contract.payment_schedule) ? contract.payment_schedule : (contract.payment_schedule ? [contract.payment_schedule] : []),
        status: contract.status,
        signed_date: contract.signed_date ? contract.signed_date.split('T')[0] : null,
        cancelled_date: contract.cancelled_date ? contract.cancelled_date.split('T')[0] : null,
        cancellation_reason: contract.cancellation_reason || '',
        notes: contract.notes || '',
        terms_conditions: contract.terms_conditions || '',
        assigned_to: contract.assigned_to,
        project_manager: contract.project_manager,
        is_active: Boolean(contract.is_active),
      });
    }
  }, [contract]);

  // Update payment schedule items when form data changes
  useEffect(() => {
    if (Array.isArray(formData.payment_schedule)) {
      setPaymentScheduleItems(formData.payment_schedule);
    }
  }, [formData.payment_schedule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDirectInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: keyof UpdateContractRequest, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDirectSelectChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (name: keyof UpdateContractRequest, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Payment schedule management
  const addPaymentScheduleItem = () => {
    if (newPaymentItem.trim()) {
      const updatedItems = [...paymentScheduleItems, newPaymentItem.trim()];
      setPaymentScheduleItems(updatedItems);
      setFormData(prev => ({ ...prev, payment_schedule: updatedItems }));
      setNewPaymentItem('');
    }
  };

  const removePaymentScheduleItem = (index: number) => {
    const updatedItems = paymentScheduleItems.filter((_, i) => i !== index);
    setPaymentScheduleItems(updatedItems);
    setFormData(prev => ({ ...prev, payment_schedule: updatedItems }));
  };

  // Calculate remaining amount when advance payment changes
  const handleAdvancePaymentChange = (value: string) => {
    const advancePayment = parseFloat(value) || 0;
    const remainingAmount = (formData.total_amount || 0) - advancePayment;
    
    setFormData(prev => ({
      ...prev,
      advance_payment: advancePayment,
      remaining_amount: Math.max(0, remainingAmount)
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!formData.contract_number?.trim()) {
      errors.contract_number = ['Contract number is required'];
    }

    if (!formData.title?.trim()) {
      errors.title = ['Contract title is required'];
    }

    if (!formData.start_date) {
      errors.start_date = ['Start date is required'];
    }

    if (!formData.end_date) {
      errors.end_date = ['End date is required'];
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.end_date = ['End date must be after start date'];
    }

    if (formData.total_amount && formData.total_amount <= 0) {
      errors.total_amount = ['Total amount must be greater than 0'];
    }

    if (formData.advance_payment && formData.advance_payment < 0) {
      errors.advance_payment = ['Advance payment cannot be negative'];
    }

    if (formData.advance_payment && formData.total_amount && formData.advance_payment > formData.total_amount) {
      errors.advance_payment = ['Advance payment cannot exceed total amount'];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Clean formData: remove empty strings, null, and undefined values
      const dataToSend: UpdateContractRequest = {};
      for (const key in formData) {
        const value = formData[key as keyof UpdateContractRequest];
        if (value !== '' && value !== null && value !== undefined) {
          (dataToSend as any)[key] = value;
        }
      }

      await updateContractMutation.mutateAsync({ id: contractId, data: dataToSend });
      router.push('/super-admin/clients-management/contracts');
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setValidationErrors(apiErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update contract');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldErrors = (fieldName: string) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 dark:text-red-400">
            • {error}
          </p>
        ))}
      </div>
    );
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading contract details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !contract) {
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
                    Contract Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested contract could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={() => router.push('/super-admin/clients-management/contracts')} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Contracts
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
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex-none p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Contract
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update contract information below
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
                  
                  <Button
                    form="edit-contract-form"
                    type="submit"
                    disabled={updateContractMutation.isPending || loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    <span>{updateContractMutation.isPending || loading ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <Breadcrumb items={breadcrumbItems} />
                </div>

                <form id="edit-contract-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contract_number">Contract Number *</Label>
                        <Input
                          id="contract_number"
                          name="contract_number"
                          value={formData.contract_number}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.contract_number ? 'border-red-500' : ''}
                          placeholder="Enter contract number"
                        />
                        {renderFieldErrors('contract_number')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Contract Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.title ? 'border-red-500' : ''}
                          placeholder="Enter contract title"
                        />
                        {renderFieldErrors('title')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quotation_id">Related Quotation</Label>
                        <Select
                          value={formData.quotation_id?.toString() || ''}
                          onValueChange={(value) => handleDirectSelectChange('quotation_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="client_id">Client</Label>
                        <Select
                          value={formData.client_id?.toString() || ''}
                          onValueChange={(value) => handleDirectSelectChange('client_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="lead_id">Lead</Label>
                        <Select
                          value={formData.lead_id?.toString() || ''}
                          onValueChange={(value) => handleDirectSelectChange('lead_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleDirectSelectChange('currency', value)}
                        >
                          <SelectTrigger>
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

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter contract description"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Contract Dates */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.start_date ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('start_date')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.end_date ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('end_date')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signed_date">Signed Date</Label>
                        <Input
                          id="signed_date"
                          name="signed_date"
                          type="date"
                          value={formData.signed_date || ''}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cancelled_date">Cancelled Date</Label>
                        <Input
                          id="cancelled_date"
                          name="cancelled_date"
                          type="date"
                          value={formData.cancelled_date || ''}
                          onChange={(e) => handleInputChange(e)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="total_value">Total Value</Label>
                        <Input
                          id="total_value"
                          name="total_value"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.total_value || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleDirectInputChange('total_value', value);
                            handleDirectInputChange('total_amount', value);
                            handleDirectInputChange('remaining_amount', value - (formData.advance_payment || 0));
                          }}
                          placeholder="Enter total value"
                          className={validationErrors.total_value ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('total_value')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="total_amount">Total Amount *</Label>
                        <Input
                          id="total_amount"
                          name="total_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.total_amount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleDirectInputChange('total_amount', value);
                            handleDirectInputChange('remaining_amount', value - (formData.advance_payment || 0));
                          }}
                          placeholder="Enter total amount"
                          className={validationErrors.total_amount ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('total_amount')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="advance_payment">Advance Payment</Label>
                        <Input
                          id="advance_payment"
                          name="advance_payment"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.advance_payment || ''}
                          onChange={(e) => handleAdvancePaymentChange(e.target.value)}
                          placeholder="Enter advance payment"
                          className={validationErrors.advance_payment ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('advance_payment')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remaining_amount">Remaining Amount</Label>
                        <Input
                          id="remaining_amount"
                          name="remaining_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.remaining_amount || ''}
                          readOnly
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_terms">Payment Terms</Label>
                        <Select
                          value={formData.payment_terms}
                          onValueChange={(value) => handleDirectSelectChange('payment_terms', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="payment_schedule">Payment Schedule</Label>
                        <div className="space-y-3">
                          {/* Add new payment schedule item */}
                          <div className="flex gap-2">
                            <Input
                              value={newPaymentItem}
                              onChange={(e) => setNewPaymentItem(e.target.value)}
                              placeholder="e.g., Monthly, Quarterly, Upon completion, etc."
                              className="flex-1"
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
                              className="px-4"
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

                  {/* Contract Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleDirectSelectChange('status', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="assigned_to">Assigned To</Label>
                        <Select
                          value={formData.assigned_to?.toString() || ''}
                          onValueChange={(value) => handleDirectSelectChange('assigned_to', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="project_manager">Project Manager</Label>
                        <Select
                          value={formData.project_manager?.toString() || ''}
                          onValueChange={(value) => handleDirectSelectChange('project_manager', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
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

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                      <Textarea
                        id="terms_conditions"
                        name="terms_conditions"
                        value={formData.terms_conditions || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter contract terms and conditions"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter any additional notes..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="cancellation_reason">Cancellation Reason</Label>
                      <Input
                        id="cancellation_reason"
                        name="cancellation_reason"
                        value={formData.cancellation_reason || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter cancellation reason if applicable"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Active</Label>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                      />
                    </div>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { 
  useCreatePdaDocument, 
  PDA_STATUS_OPTIONS,
  CreatePdaDocumentRequest 
} from '@/modules/pda-documents';
import { useContracts } from '@/modules/contracts';
import { useClients } from '@/modules/clients';
import { toast } from 'sonner';

export default function CreatePdaDocumentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreatePdaDocumentRequest>({
    contract_id: 0,
    customer_id: 0,
    status: 'draft',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Create Document' }
  ];

  // Fetch contracts and clients for dropdowns
  const { data: contractsResponse, isLoading: contractsLoading } = useContracts();
  const { data: clientsResponse, isLoading: clientsLoading } = useClients();

  const contracts = contractsResponse?.data.contracts || [];
  const clients = clientsResponse?.data.clients || [];

  // Set first contract and client as default when data loads
  useEffect(() => {
    if (contracts.length > 0 && formData.contract_id === 0) {
      setFormData(prev => ({
        ...prev,
        contract_id: contracts[0].id
      }));
    }
  }, [contracts, formData.contract_id]);

  useEffect(() => {
    if (clients.length > 0 && formData.customer_id === 0) {
      setFormData(prev => ({
        ...prev,
        customer_id: clients[0].id
      }));
    }
  }, [clients, formData.customer_id]);

  // Create mutation
  const createMutation = useCreatePdaDocument();

  const handleInputChange = (field: keyof CreatePdaDocumentRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.contract_id || formData.contract_id === 0) {
        toast.error('Please select a contract');
        setIsSubmitting(false);
        return;
      }

      if (!formData.customer_id || formData.customer_id === 0) {
        toast.error('Please select a customer');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      router.push('/super-admin/pda-documents');
    } catch (error) {
      console.error('Error creating PDA document:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create PDA document';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/super-admin/pda-documents');
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create PDA Document</h1>
                <p className="text-gray-600 dark:text-gray-400">Create a new PDA document</p>
              </div>
              
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>

            {/* Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contract Selection */}
                <div className="space-y-2">
                  <Label htmlFor="contract_id">
                    Contract <span className="text-red-500">*</span>
                  </Label>
                  {contractsLoading ? (
                    <div className="text-sm text-gray-500">Loading contracts...</div>
                  ) : contracts.length === 0 ? (
                    <div className="text-sm text-red-500">No contracts available</div>
                  ) : (
                    <Select
                      value={formData.contract_id > 0 ? formData.contract_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('contract_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a contract..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id.toString()}>
                            {contract.contract_number} - {contract.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customer_id">
                    Customer <span className="text-red-500">*</span>
                  </Label>
                  {clientsLoading ? (
                    <div className="text-sm text-gray-500">Loading customers...</div>
                  ) : clients.length === 0 ? (
                    <div className="text-sm text-red-500">No customers available</div>
                  ) : (
                    <Select
                      value={formData.customer_id > 0 ? formData.customer_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('customer_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} {client.company_name ? `- ${client.company_name}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PDA_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any notes about this document"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Create Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}


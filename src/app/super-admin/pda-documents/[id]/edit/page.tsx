'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  usePdaDocument,
  useUpdatePdaDocument,
  PDA_STATUS_OPTIONS,
  UpdatePdaDocumentRequest
} from '@/modules/pda-documents';
import { useContracts } from '@/modules/contracts';
import { useClients } from '@/modules/clients';
import { toast } from 'sonner';

export default function EditPdaDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<UpdatePdaDocumentRequest>({
    contract_id: 0,
    customer_id: 0,
    status: 'draft',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Document Details', href: `/super-admin/pda-documents/${documentId}` },
    { label: 'Edit' }
  ];

  // Fetch document details
  const { data: documentResponse, isLoading: documentLoading } = usePdaDocument(documentId);
  const document = documentResponse?.data;

  // Fetch contracts and clients for dropdowns
  const { data: contractsResponse, isLoading: contractsLoading } = useContracts();
  const { data: clientsResponse, isLoading: clientsLoading } = useClients();

  const contracts = contractsResponse?.data.contracts || [];
  const clients = clientsResponse?.data.clients || [];

  // Update mutation
  const updateMutation = useUpdatePdaDocument();

  // Initialize form data when document is loaded
  useEffect(() => {
    if (document && !contractsLoading && !clientsLoading && !documentLoading) {
      setFormData({
        contract_id: document.contract_id,
        customer_id: document.customer_id,
        status: document.status,
        notes: document.notes || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, contractsLoading, clientsLoading, documentLoading]);

  const handleInputChange = (field: keyof UpdatePdaDocumentRequest, value: any) => {
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

      // Prepare submit data - include all fields even if not changed
      const submitData: UpdatePdaDocumentRequest = {
        contract_id: formData.contract_id || document?.contract_id || 0,
        customer_id: formData.customer_id || document?.customer_id || 0,
        status: formData.status || document?.status || 'draft',
        notes: formData.notes !== undefined ? formData.notes : (document?.notes || '')
      };

      await updateMutation.mutateAsync({ id: documentId, data: submitData });
      router.push(`/super-admin/pda-documents/${documentId}`);
    } catch (error) {
      console.error('Error updating PDA document:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to update PDA document';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${documentId}`);
  };

  if (documentLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading document...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (!document) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Document Not Found
                </h3>
                <Button
                  onClick={() => router.push('/super-admin/pda-documents')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Documents
                </Button>
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
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit PDA Document</h1>
                <p className="text-gray-600 dark:text-gray-400">Update document information</p>
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
                  {contractsLoading || !document ? (
                    <div className="text-sm text-gray-500">Loading contracts...</div>
                  ) : contracts.length === 0 ? (
                    <div className="text-sm text-red-500">No contracts available</div>
                  ) : (
                    <Select
                      value={formData.contract_id && formData.contract_id > 0 ? formData.contract_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('contract_id', parseInt(value))}
                      key={`contract-${document.id}-${formData.contract_id}`}
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
                  {clientsLoading || !document ? (
                    <div className="text-sm text-gray-500">Loading customers...</div>
                  ) : clients.length === 0 ? (
                    <div className="text-sm text-red-500">No customers available</div>
                  ) : (
                    <Select
                      value={formData.customer_id && formData.customer_id > 0 ? formData.customer_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('customer_id', parseInt(value))}
                      key={`customer-${document.id}-${formData.customer_id}`}
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
                    value={formData.status ? formData.status : ''}
                    onValueChange={(value) => handleInputChange('status', value)}
                    key={`status-${document?.id}-${formData.status || 'empty'}`}
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Document
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


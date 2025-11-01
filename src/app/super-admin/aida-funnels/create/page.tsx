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
  useCreateAidaFunnel, 
  AIDA_STAGES,
  CreateAidaFunnelRequest 
} from '@/modules/aida-funnels';
import { usePdaDocuments } from '@/modules/pda-documents';
import { useContracts } from '@/modules/contracts';
import { toast } from 'sonner';

export default function CreateAidaFunnelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateAidaFunnelRequest>({
    contract_id: 0,
    pda_document_id: 0,
    stage: 'attention',
    description: '',
    order: 1
  });

  const breadcrumbItems = [
    { label: 'AIDA Funnels', href: '/super-admin/aida-funnels' },
    { label: 'Create Funnel' }
  ];

  // Fetch PDA documents and contracts for dropdowns
  const { data: pdaDocumentsResponse, isLoading: pdaDocumentsLoading } = usePdaDocuments();
  const { data: contractsResponse, isLoading: contractsLoading } = useContracts();

  const pdaDocuments = pdaDocumentsResponse?.data.pda_documents || [];
  const contracts = contractsResponse?.data.contracts || [];

  // Set first PDA document and contract as default when data loads
  useEffect(() => {
    if (pdaDocuments.length > 0 && formData.pda_document_id === 0) {
      setFormData(prev => ({
        ...prev,
        pda_document_id: pdaDocuments[0].id
      }));
    }
  }, [pdaDocuments, formData.pda_document_id]);

  useEffect(() => {
    if (contracts.length > 0 && formData.contract_id === 0) {
      setFormData(prev => ({
        ...prev,
        contract_id: contracts[0].id
      }));
    }
  }, [contracts, formData.contract_id]);

  // Create mutation
  const createMutation = useCreateAidaFunnel();

  const handleInputChange = (field: keyof CreateAidaFunnelRequest, value: any) => {
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

      if (!formData.pda_document_id || formData.pda_document_id === 0) {
        toast.error('Please select a PDA document');
        setIsSubmitting(false);
        return;
      }

      if (!formData.stage) {
        toast.error('Please select a stage');
        setIsSubmitting(false);
        return;
      }

      if (!formData.order || formData.order < 1) {
        toast.error('Order must be at least 1');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      router.push('/super-admin/aida-funnels');
    } catch (error) {
      console.error('Error creating AIDA funnel:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create AIDA funnel';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/super-admin/aida-funnels');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create AIDA Funnel</h1>
                <p className="text-gray-600 dark:text-gray-400">Create a new AIDA marketing funnel</p>
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading contracts...</div>
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

                {/* PDA Document Selection */}
                <div className="space-y-2">
                  <Label htmlFor="pda_document_id">
                    PDA Document <span className="text-red-500">*</span>
                  </Label>
                  {pdaDocumentsLoading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading PDA documents...</div>
                  ) : pdaDocuments.length === 0 ? (
                    <div className="text-sm text-red-500">No PDA documents available</div>
                  ) : (
                    <Select
                      value={formData.pda_document_id > 0 ? formData.pda_document_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('pda_document_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a PDA document..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pdaDocuments.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id.toString()}>
                            Document #{doc.id} - Status: {doc.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Stage Selection */}
                <div className="space-y-2">
                  <Label htmlFor="stage">
                    Stage <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIDA_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">
                    Order <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                    placeholder="Enter order number"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter funnel description"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                        Create Funnel
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


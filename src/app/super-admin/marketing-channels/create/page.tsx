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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon, PlusIcon, XIcon } from '@/components/ui/icons';
import { 
  useCreateMarketingChannel, 
  CHANNEL_TYPE_OPTIONS,
  CreateMarketingChannelRequest 
} from '@/modules/marketing-channels';
import { usePdaDocuments } from '@/modules/pda-documents';
import { toast } from 'sonner';

export default function CreateMarketingChannelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<string[]>(['']);
  const [detailInput, setDetailInput] = useState('');
  
  const [formData, setFormData] = useState<CreateMarketingChannelRequest>({
    pda_document_id: '',
    channel_type: 'online',
    name: '',
    details: []
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Create Channel' }
  ];

  // Fetch PDA documents for dropdown
  const { data: pdaDocumentsResponse, isLoading: pdaDocumentsLoading } = usePdaDocuments();
  const pdaDocuments = pdaDocumentsResponse?.data.pda_documents || [];

  // Set first PDA document as default when data loads
  useEffect(() => {
    if (pdaDocuments.length > 0 && !formData.pda_document_id) {
      setFormData(prev => ({
        ...prev,
        pda_document_id: pdaDocuments[0].id.toString()
      }));
    }
  }, [pdaDocuments, formData.pda_document_id]);

  // Create mutation
  const createMutation = useCreateMarketingChannel();

  const handleInputChange = (field: keyof CreateMarketingChannelRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDetail = () => {
    if (detailInput.trim()) {
      setDetails(prev => [...prev, detailInput.trim()]);
      setDetailInput('');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.pda_document_id) {
        toast.error('Please select a PDA document');
        setIsSubmitting(false);
        return;
      }

      if (!formData.name || formData.name.trim() === '') {
        toast.error('Please enter a channel name');
        setIsSubmitting(false);
        return;
      }

      if (!formData.channel_type) {
        toast.error('Please select a channel type');
        setIsSubmitting(false);
        return;
      }

      // Filter out empty details and submit
      const filteredDetails = details.filter(d => d.trim() !== '');
      
      const submitData = {
        ...formData,
        details: filteredDetails
      };

      await createMutation.mutateAsync(submitData);
      toast.success('Marketing channel created successfully');
      router.push('/super-admin/marketing-channels');
    } catch (error) {
      console.error('Error creating marketing channel:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create marketing channel';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/super-admin/marketing-channels');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Marketing Channel</h1>
                <p className="text-gray-600 dark:text-gray-400">Create a new marketing channel</p>
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
                      value={formData.pda_document_id.toString()}
                      onValueChange={(value) => handleInputChange('pda_document_id', value)}
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

                {/* Channel Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="channel_type">
                    Channel Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.channel_type}
                    onValueChange={(value) => handleInputChange('channel_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Channel Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Channel Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter channel name"
                    required
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Details
                  </Label>
                  
                  {/* Existing details */}
                  {details.map((detail, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                        placeholder={`Detail ${index + 1}`}
                      />
                      {details.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add new detail */}
                  <div className="flex gap-2">
                    <Input
                      value={detailInput}
                      onChange={(e) => setDetailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDetail();
                        }
                      }}
                      placeholder="Add a new detail"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDetail}
                      disabled={!detailInput.trim()}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
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
                        Create Channel
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


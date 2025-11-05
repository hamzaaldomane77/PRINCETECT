'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useMarketingMix, useUpdateMarketingMix } from '@/modules/marketing-mixes';
import { UpdateMarketingMixRequest, ELEMENT_OPTIONS } from '@/modules/marketing-mixes/types';
import { usePdaDocuments } from '@/modules/pda-documents';
import { toast } from 'sonner';

interface EditMarketingMixPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMarketingMixPage({ params }: EditMarketingMixPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const marketingMixId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateMarketingMixRequest>({
    pda_document_id: '',
    element: 'product',
    title: '',
    description: null,
    notes: null,
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const formInitialized = useRef(false);

  // Fetch marketing mix data and PDA documents
  const { data: marketingMixResponse, isLoading, error } = useMarketingMix(marketingMixId);
  const updateMarketingMixMutation = useUpdateMarketingMix();
  
  // Fetch PDA documents for dropdown
  const { data: pdaDocumentsResponse, isLoading: pdaDocumentsLoading } = usePdaDocuments();
  const pdaDocuments = pdaDocumentsResponse?.data?.pda_documents || [];

  const marketingMix = marketingMixResponse?.data;

  const breadcrumbItems = [
    { label: 'Marketing Mixes', href: '/super-admin/marketing-mixes' },
    { label: marketingMix?.title || 'Edit Marketing Mix' }
  ];

  // Reset form initialization when ID changes
  useEffect(() => {
    formInitialized.current = false;
  }, [marketingMixId]);

  // Populate form when marketing mix data is loaded (only once)
  useEffect(() => {
    if (marketingMix && !isLoading && !pdaDocumentsLoading && !formInitialized.current) {
      setFormData({
        pda_document_id: marketingMix.pda_document_id.toString(),
        element: marketingMix.element,
        title: marketingMix.title,
        description: marketingMix.description || null,
        notes: marketingMix.notes || null,
      });
      formInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketingMix, isLoading, pdaDocumentsLoading]);

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

  const handleSelectChange = (name: keyof UpdateMarketingMixRequest, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!formData.title?.trim()) {
      errors.title = ['Title is required'];
    }

    if (!formData.element) {
      errors.element = ['Element is required'];
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
      const dataToSend: UpdateMarketingMixRequest = {};
      for (const key in formData) {
        const value = formData[key as keyof UpdateMarketingMixRequest];
        if (value !== '' && value !== null && value !== undefined) {
          // Convert pda_document_id to number if it's a string
          if (key === 'pda_document_id' && value) {
            (dataToSend as any)[key] = typeof value === 'string' ? parseInt(value) : value;
          } else {
            (dataToSend as any)[key] = value;
          }
        }
      }

      await updateMarketingMixMutation.mutateAsync({ id: marketingMixId, data: dataToSend });
      router.push('/super-admin/marketing-mixes');
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setValidationErrors(apiErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update marketing mix');
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading marketing mix details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !marketingMix) {
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
                    Marketing Mix Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested marketing mix could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={() => router.push('/super-admin/marketing-mixes')} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Marketing Mixes
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
                    Edit Marketing Mix
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update marketing mix information below
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
                    form="edit-marketing-mix-form"
                    type="submit"
                    disabled={updateMarketingMixMutation.isPending || loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    <span>{updateMarketingMixMutation.isPending || loading ? 'Saving...' : 'Save Changes'}</span>
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

                <form id="edit-marketing-mix-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pda_document_id">PDA Document</Label>
                        {pdaDocumentsLoading ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Loading PDA documents...</div>
                        ) : pdaDocuments.length === 0 ? (
                          <div className="text-sm text-red-500">No PDA documents available</div>
                        ) : (
                        <Select
                          value={formData.pda_document_id ? formData.pda_document_id.toString() : ''}
                          onValueChange={(value) => handleSelectChange('pda_document_id', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select PDA Document" />
                          </SelectTrigger>
                          <SelectContent>
                              {pdaDocuments.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id.toString()}>
                                  Document #{doc.id} - Contract #{doc.contract_id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {renderFieldErrors('pda_document_id')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="element">Element *</Label>
                        <Select
                          value={formData.element || 'product'}
                          onValueChange={(value) => handleSelectChange('element', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select element" />
                          </SelectTrigger>
                          <SelectContent>
                            {ELEMENT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldErrors('element')}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange(e)}
                          className={`h-11 ${validationErrors.title ? 'border-red-500' : ''}`}
                          placeholder="Enter marketing mix title"
                        />
                        {renderFieldErrors('title')}
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter marketing mix description"
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


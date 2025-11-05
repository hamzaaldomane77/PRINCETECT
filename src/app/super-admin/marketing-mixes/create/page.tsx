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
import { ArrowLeftIcon, PlusIcon } from '@/components/ui/icons';
import { useCreateMarketingMix } from '@/modules/marketing-mixes';
import { CreateMarketingMixRequest, ELEMENT_OPTIONS } from '@/modules/marketing-mixes/types';
import { usePdaDocuments } from '@/modules/pda-documents';
import { toast } from 'sonner';

export default function CreateMarketingMixPage() {
  const router = useRouter();
  const createMarketingMixMutation = useCreateMarketingMix();

  // Fetch PDA documents for dropdown
  const { data: pdaDocumentsResponse } = usePdaDocuments();
  const pdaDocuments = pdaDocumentsResponse?.data?.pda_documents || [];

  const [formData, setFormData] = useState<CreateMarketingMixRequest>({
    pda_document_id: '',
    element: 'product',
    title: '',
    description: null,
    notes: null,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);

  const breadcrumbItems = [
    { label: 'Marketing Mixes', href: '/super-admin/marketing-mixes' },
    { label: 'Create New Marketing Mix' }
  ];

  const handleInputChange = (field: keyof CreateMarketingMixRequest, value: any) => {
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

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Required field validations
    if (!formData.pda_document_id) {
      newErrors.pda_document_id = ['PDA Document is required'];
    }

    if (!formData.title.trim()) {
      newErrors.title = ['Title is required'];
    }

    if (!formData.element) {
      newErrors.element = ['Element is required'];
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
      setTimeout(scrollToError, 100);
      return;
    }

    try {
      // Create a clean copy with only meaningful values
      const cleanedData = {
        ...formData,
        pda_document_id: typeof formData.pda_document_id === 'string' 
          ? parseInt(formData.pda_document_id) 
          : formData.pda_document_id,
        description: formData.description || null,
        notes: formData.notes || null,
      };

      await createMarketingMixMutation.mutateAsync(cleanedData);
      toast.success('Marketing mix created successfully!');
      router.push('/super-admin/marketing-mixes');
    } catch (error) {
      console.error('Failed to create marketing mix:', error);
      
      // Handle API validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data?.errors) {
          const serverErrors: Record<string, string[]> = {};
          Object.keys(apiError.response.data.errors).forEach(field => {
            const fieldErrors = apiError.response.data.errors[field];
            serverErrors[field] = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
          });
          setErrors(serverErrors);
          setTimeout(scrollToError, 100);
          
          const errorCount = Object.keys(serverErrors).length;
          const totalErrors = Object.values(serverErrors).reduce((acc, errors) => acc + errors.length, 0);
          toast.error(`Found ${totalErrors} validation error${totalErrors > 1 ? 's' : ''} in ${errorCount} field${errorCount > 1 ? 's' : ''}. Please check the form below.`);
          setIsValidating(false);
          return;
        }
      }

      const errorMessage = (error as Error)?.message || 'Failed to create marketing mix. Please try again.';
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Marketing Mix</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new marketing mix to the system</p>
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
                        Enter the basic marketing mix information
                      </p>
                    </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* PDA Document */}
                      <div className="space-y-2">
                        <Label htmlFor="pda_document_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          PDA Document *
                        </Label>
                        <Select
                          value={formData.pda_document_id?.toString() || ''}
                          onValueChange={(value) => handleInputChange('pda_document_id', value)}
                        >
                          <SelectTrigger className="h-11" id="pda_document_id">
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
                        {renderFieldErrors('pda_document_id')}
                      </div>

                      {/* Element */}
                      <div className="space-y-2">
                        <Label htmlFor="element" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Element *
                        </Label>
                        <Select
                          value={formData.element}
                          onValueChange={(value) => handleInputChange('element', value)}
                        >
                          <SelectTrigger className="h-11" id="element">
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

                      {/* Title */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter marketing mix title"
                          required
                          className={`h-11 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('title')}
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
                        placeholder="Enter marketing mix description"
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
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={createMarketingMixMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMarketingMixMutation.isPending || isValidating}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(createMarketingMixMutation.isPending || isValidating) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isValidating ? 'Validating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Marketing Mix
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


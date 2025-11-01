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
import { ArrowLeftIcon, SaveIcon, RefreshIcon } from '@/components/ui/icons';
import { useSwotAnalysis, useSaveSwotAnalysis } from '@/modules/pda-documents/hooks/use-swot';
import { SaveSwotAnalysisRequest } from '@/modules/pda-documents/types/swot';
import { toast } from 'sonner';

export default function SwotAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const {
    data: swotResponse,
    isLoading,
    error,
    isError,
    refetch
  } = useSwotAnalysis(pdaDocumentId);

  const saveSwotMutation = useSaveSwotAnalysis(pdaDocumentId);
  
  // swotResponse will be null if SWOT doesn't exist yet (404)
  const swotData = swotResponse?.data;

  const [formData, setFormData] = useState<SaveSwotAnalysisRequest>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  });

  useEffect(() => {
    if (swotData) {
      setFormData({
        strengths: swotData.strengths || '',
        weaknesses: swotData.weaknesses || '',
        opportunities: swotData.opportunities || '',
        threats: swotData.threats || ''
      });
    }
  }, [swotData]);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'SWOT Analysis' }
  ];

  const handleInputChange = (field: keyof SaveSwotAnalysisRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveSwotMutation.mutateAsync(formData);
      router.push('/super-admin/pda-documents');
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to save SWOT analysis';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading SWOT Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Show loading state only on initial load
  if (isLoading && !swotData && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading SWOT Analysis...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Only show error for real errors (not "not found" cases)
  // If swotResponse is null, it means SWOT doesn't exist yet (404 or not found), which is fine
  if (isError && error && swotResponse !== null && !swotData) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SWOT Analysis for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage SWOT analysis for this PDA document</p>
              </div>
              <ErrorDisplay error={error} onRetry={handleRetry} />
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
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SWOT Analysis</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage SWOT analysis for PDA Document {pdaDocumentId}</p>
              </div>
              <Button
                onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}`)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Document</span>
              </Button>
            </div>

            {swotData ? (
              <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">SWOT Analysis Information</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                      Last updated: {formatDate(swotData.updated_at)}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-green-600 dark:text-green-400 text-2xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">Create New SWOT Analysis</h3>
                    <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                      No SWOT analysis exists yet for this document. Fill in the form below to create one.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="p-6 border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💪</span>
                      <Label htmlFor="strengths" className="text-lg font-semibold text-green-700 dark:text-green-400">
                        Strengths
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What are the internal advantages and positive attributes?
                    </p>
                    <Textarea
                      id="strengths"
                      value={formData.strengths || ''}
                      onChange={(e) => handleInputChange('strengths', e.target.value)}
                      placeholder="Enter strengths..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </Card>

                {/* Weaknesses */}
                <Card className="p-6 border-red-200 dark:border-red-800">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⚠️</span>
                      <Label htmlFor="weaknesses" className="text-lg font-semibold text-red-700 dark:text-red-400">
                        Weaknesses
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What are the internal disadvantages and areas for improvement?
                    </p>
                    <Textarea
                      id="weaknesses"
                      value={formData.weaknesses || ''}
                      onChange={(e) => handleInputChange('weaknesses', e.target.value)}
                      placeholder="Enter weaknesses..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </Card>

                {/* Opportunities */}
                <Card className="p-6 border-blue-200 dark:border-blue-800">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌟</span>
                      <Label htmlFor="opportunities" className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                        Opportunities
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What external factors can be leveraged for growth?
                    </p>
                    <Textarea
                      id="opportunities"
                      value={formData.opportunities || ''}
                      onChange={(e) => handleInputChange('opportunities', e.target.value)}
                      placeholder="Enter opportunities..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </Card>

                {/* Threats */}
                <Card className="p-6 border-orange-200 dark:border-orange-800">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⚡</span>
                      <Label htmlFor="threats" className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                        Threats
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What external challenges could cause problems?
                    </p>
                    <Textarea
                      id="threats"
                      value={formData.threats || ''}
                      onChange={(e) => handleInputChange('threats', e.target.value)}
                      placeholder="Enter threats..."
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </Card>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}`)}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Save SWOT Analysis
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}


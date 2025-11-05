'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMarketingMix, useDeleteMarketingMix } from '@/modules/marketing-mixes';
import { toast } from 'sonner';

interface MarketingMixDetailsPageProps {
  params: Promise<{ id: string }>;
}

const elementColors = {
  product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  price: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  place: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  promotion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export default function MarketingMixDetailsPage({ params }: MarketingMixDetailsPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  const resolvedParams = use(params);
  const marketingMixId = parseInt(resolvedParams.id);

  const { data: marketingMixResponse, isLoading, error } = useMarketingMix(marketingMixId);
  const deleteMarketingMixMutation = useDeleteMarketingMix();

  const marketingMix = marketingMixResponse?.data;

  const breadcrumbItems = [
    { label: 'Marketing Mixes', href: '/super-admin/marketing-mixes' },
    { label: marketingMix?.title || 'Marketing Mix Details' }
  ];

  const handleEdit = () => {
    router.push(`/super-admin/marketing-mixes/${marketingMixId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!marketingMix) return;
    
    try {
      await deleteMarketingMixMutation.mutateAsync(marketingMix.id);
      router.push('/super-admin/marketing-mixes');
    } catch (error) {
      console.error('Failed to delete marketing mix:', error);
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !marketingMix) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Marketing Mix not found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The marketing mix you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/super-admin/marketing-mixes')}>
                Back to Marketing Mixes
              </Button>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full w-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{marketingMix.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  <Badge className={elementColors[marketingMix.element as keyof typeof elementColors] || elementColors.product}>
                    {marketingMix.element.toUpperCase()}
                  </Badge>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleEdit} className="flex items-center gap-2">
                  <EditIcon className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  onClick={() => router.back()} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 w-full">
                <div className="mb-6">
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                
                <div className="space-y-8">
                  {/* Marketing Mix Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Element</Label>
                            <div className="mt-1">
                              <Badge className={elementColors[marketingMix.element as keyof typeof elementColors] || elementColors.product}>
                                {marketingMix.element.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{marketingMix.title}</p>
                          </div>
                        </div>
                        {marketingMix.description && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{marketingMix.description}</p>
                          </div>
                        )}
                        {marketingMix.notes && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{marketingMix.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* PDA Document Information */}
                    {marketingMix.pda_document && (
                      <Card>
                        <CardHeader>
                          <CardTitle>PDA Document Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Document ID</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">#{marketingMix.pda_document.id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract ID</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">#{marketingMix.pda_document.contract_id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">#{marketingMix.pda_document.customer_id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{marketingMix.pda_document.status}</p>
                          </div>
                          {marketingMix.pda_document.notes && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Notes</Label>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{marketingMix.pda_document.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Timestamps */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Timestamps</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</Label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {new Date(marketingMix.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated At</Label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {new Date(marketingMix.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Marketing Mix</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this marketing mix? This action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMarketingMixMutation.isPending}
              >
                {deleteMarketingMixMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Marketing Mix'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}


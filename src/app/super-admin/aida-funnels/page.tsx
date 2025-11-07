'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';
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
import { useAidaFunnels, useDeleteAidaFunnel, useReorderAidaFunnels, AidaFunnel } from '@/modules/aida-funnels';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const stageColors: Record<string, string> = {
  attention: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  interest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  desire: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  action: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

// Sortable Row Component
interface SortableRowProps {
  funnel: AidaFunnel;
  onView: (funnel: AidaFunnel) => void;
  onEdit: (funnel: AidaFunnel) => void;
  onDelete: (funnel: AidaFunnel) => void;
  formatDate: (date: string) => string;
}

function SortableRow({ funnel, onView, onEdit, onDelete, formatDate }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: funnel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <td className="px-4 py-3 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">{funnel.id}</td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
        Document #{funnel.pda_document_id}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge className={stageColors[funnel.stage.toLowerCase()] || stageColors.attention}>
          {funnel.stage.charAt(0).toUpperCase() + funnel.stage.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
        {funnel.description || 'N/A'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">{funnel.order}</td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
        {formatDate(funnel.created_at)}
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => onView(funnel)}
            className="p-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onEdit(funnel)}
            className="p-2 h-8 w-8 bg-orange-600 hover:bg-orange-700 text-white"
            title="Edit"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(funnel)}
            className="p-2 h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AidaFunnelsPage() {
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<AidaFunnel | null>(null);
  const [sortedFunnels, setSortedFunnels] = useState<AidaFunnel[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'AIDA Funnels' }
  ];

  // Fetch AIDA Funnels using the hook
  const {
    data: funnelsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useAidaFunnels();

  const funnels = funnelsResponse?.data?.aida_funnels || [];

  // Debug: Log response data
  console.log('AIDA Funnels Response:', funnelsResponse);
  console.log('AIDA Funnels:', funnels);

  // Mutations
  const deleteFunnelMutation = useDeleteAidaFunnel();
  const reorderFunnelsMutation = useReorderAidaFunnels();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted funnels when data changes
  useEffect(() => {
    if (funnels.length > 0) {
      // Sort by order field
      const sorted = [...funnels].sort((a, b) => a.order - b.order);
      setSortedFunnels(sorted);
      setHasChanges(false);
    }
  }, [funnels]);

  const handleCreateFunnel = () => {
    router.push('/super-admin/aida-funnels/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteFunnel = (funnel: AidaFunnel) => {
    setFunnelToDelete(funnel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!funnelToDelete) return;

    try {
      await deleteFunnelMutation.mutateAsync(funnelToDelete.id);
      refetch();
    } catch (error) {
      console.error('Error deleting funnel:', error);
    } finally {
      setDeleteDialogOpen(false);
      setFunnelToDelete(null);
    }
  };

  const handleViewFunnel = (funnel: AidaFunnel) => {
    router.push(`/super-admin/aida-funnels/${funnel.id}`);
  };

  const handleEditFunnel = (funnel: AidaFunnel) => {
    router.push(`/super-admin/aida-funnels/${funnel.id}/edit`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedFunnels((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      // Prepare data for API
      const reorderData = {
        funnels: sortedFunnels.map((funnel, index) => ({
          id: funnel.id,
          order: index + 1, // Start order from 1
        })),
      };

      await reorderFunnelsMutation.mutateAsync(reorderData);
      setHasChanges(false);
      refetch();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleCancelReorder = () => {
    // Reset to original order
    const sorted = [...funnels].sort((a, b) => a.order - b.order);
    setSortedFunnels(sorted);
    setHasChanges(false);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
          Error Loading AIDA Funnels
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
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading AIDA Funnels...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AIDA Funnels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage AIDA marketing funnels</p>
              </div>

              {/* Error Display */}
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
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AIDA Funnels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage AIDA marketing funnels</p>
              </div>

              {/* Create Funnel Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateFunnel}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Funnel</span>
                </Button>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {hasChanges && (
              <div className="flex items-center justify-end gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  You have unsaved changes to the order
                </span>
                <Button
                  onClick={handleCancelReorder}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  disabled={reorderFunnelsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveOrder}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={reorderFunnelsMutation.isPending}
                >
                  {reorderFunnelsMutation.isPending ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            )}

            {/* Sortable Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {sortedFunnels.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                              Drag
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                              ID
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              PDA Document
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Stage
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                              Order
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-44">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <SortableContext
                          items={sortedFunnels.map((f) => f.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedFunnels.map((funnel) => (
                              <SortableRow
                                key={funnel.id}
                                funnel={funnel}
                                onView={handleViewFunnel}
                                onEdit={handleEditFunnel}
                                onDelete={handleDeleteFunnel}
                                formatDate={formatDate}
                              />
                            ))}
                          </tbody>
                        </SortableContext>
                      </table>
                    </div>
                  </div>
                </DndContext>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No AIDA Funnels Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No funnels are currently available. Create your first funnel to get started.
                    </p>
                    <Button
                      onClick={handleCreateFunnel}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Funnel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this AIDA funnel?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteFunnelMutation.isPending}
              >
                {deleteFunnelMutation.isPending ? 'Deleting...' : 'Delete Funnel'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}


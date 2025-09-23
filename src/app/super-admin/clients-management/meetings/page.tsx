'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
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
import { useMeetings, useDeleteMeeting } from '@/modules/meetings';
import { Meeting } from '@/modules/meetings/types';
import { toast } from 'sonner';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  postponed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
};

const typeColors = {
  in_person: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  video_call: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  phone_call: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

const categoryColors = {
  lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  client: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  internal: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  management: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};


export default function MeetingsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings' }
  ];

  // Fetch meetings using the hook
  const { 
    data: meetingsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useMeetings();

  // Safely extract meetings data
  const meetings = meetingsResponse?.data?.meetings || [];
  
  // Debug logging
  console.log('Meetings Response:', meetingsResponse);
  console.log('Meetings Data:', meetings);

  // Mutations
  const deleteMeetingMutation = useDeleteMeeting();

  const handleCreateMeeting = () => {
    router.push('/super-admin/clients-management/meetings/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;
    
    try {
      await deleteMeetingMutation.mutateAsync(meetingToDelete.id);
      toast.success('Meeting deleted successfully!');
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this meeting.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Meeting not found. It may have been already deleted.');
        refetch();
      } else {
        toast.error('Failed to delete meeting. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'logo', label: 'Logo', type: 'logo', width: '60px' },
    { key: 'title', label: 'Meeting Title', type: 'text', align: 'right' },
    { key: 'client_name', label: 'Client/Lead', type: 'text', align: 'right' },
    { key: 'meeting_date', label: 'Date', type: 'text', align: 'right' },
    { key: 'meeting_time', label: 'Time', type: 'text', align: 'right' },
    { key: 'duration_minutes', label: 'Duration', type: 'text', align: 'center' },
    { key: 'location', label: 'Location', type: 'text', align: 'right' },
    { key: 'assigned_employee_name', label: 'Assigned To', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'text', align: 'center' },
    { key: 'meeting_type', label: 'Type', type: 'text', align: 'center' },
    { key: 'category', label: 'Category', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (meeting: Meeting) => {
        router.push(`/super-admin/clients-management/meetings/${meeting.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Meeting',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (meeting: Meeting) => {
        router.push(`/super-admin/clients-management/meetings/${meeting.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Meeting',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteMeeting
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  // Function to format date with day, month, year
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

  // Function to format time
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Transform meetings data for the table
  const transformedMeetings = (meetings || []).map(meeting => ({
    ...meeting,
    logo: meeting.lead?.logo || meeting.client?.logo || '/placeholder-logo.svg',
    client_name: meeting.lead?.name || meeting.client?.name || 'N/A',
    meeting_date: formatDate(meeting.meeting_date),
    meeting_time: formatTime(meeting.meeting_time),
    duration_minutes: `${meeting.duration_minutes} min`,
    assigned_employee_name: meeting.assigned_employee?.name || 'N/A',
    status: (
      <Badge className={statusColors[meeting.status] || statusColors.scheduled}>
        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
      </Badge>
    ),
    meeting_type: (
      <Badge className={typeColors[meeting.meeting_type] || typeColors.in_person}>
        {meeting.meeting_type.replace('_', ' ').charAt(0).toUpperCase() + meeting.meeting_type.replace('_', ' ').slice(1)}
      </Badge>
    ),
    category: (
      <Badge className={categoryColors[meeting.category] || categoryColors.lead}>
        {meeting.category.charAt(0).toUpperCase() + meeting.category.slice(1)}
      </Badge>
    ),
    created_at: formatDate(meeting.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Meetings
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

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading meetings...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Handle case where data is still loading or undefined
  if (!meetingsResponse && !isLoading && !error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Schedule and manage customer meetings</p>
              </div>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    Unable to load meetings data. Please try again.
                  </p>
                  <Button
                    onClick={handleRetry}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <RefreshIcon className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Schedule and manage customer meetings</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Schedule and manage customer meetings</p>
            </div>
            
            {/* Create Meeting Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateMeeting}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Meeting</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {meetings && meetings.length > 0 ? (
                <DataTable
                  data={transformedMeetings}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search meetings..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  defaultItemsPerPage={10}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Meetings Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No meetings are currently scheduled. Create your first meeting to get started.
                    </p>
                    <Button
                      onClick={handleCreateMeeting}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Meeting
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
                Are you sure you want to delete the meeting &quot;{meetingToDelete?.title}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteMeetingMutation.isPending}
              >
                {deleteMeetingMutation.isPending ? 'Deleting...' : 'Delete Meeting'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Cannot Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}
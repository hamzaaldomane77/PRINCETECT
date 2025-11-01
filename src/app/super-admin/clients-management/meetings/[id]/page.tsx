'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionWrapper } from '@/components/auth/permission-wrapper';
import { useMeeting } from '@/modules/meetings';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, FileTextIcon, UsersIcon, CheckCircleIcon } from '@/components/ui/icons';

interface MeetingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MeetingDetailsPage({ params }: MeetingDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = parseInt(resolvedParams.id);

  const { data: meetingResponse, isLoading, error } = useMeeting(meetingId);

  // Extract meeting data
  const meeting = meetingResponse?.data?.meeting;
  const isSuccess = meetingResponse?.success;

  console.log('Meeting Response:', meetingResponse);
  console.log('Meeting Data:', meeting);
  console.log('Meeting ID:', meetingId);
  console.log('Is Success:', isSuccess);
  console.log('Is Loading:', isLoading);
  console.log('Error:', error);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings', href: '/super-admin/clients-management/meetings' },
    { label: meeting?.title || 'Meeting Details' }
  ];

  const handleEdit = () => {
    router.push(`/super-admin/clients-management/meetings/${meetingId}/edit`);
  };

  const handleBack = () => {
    router.push('/super-admin/clients-management/meetings');
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

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get meeting type color
  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'in_person': return 'bg-purple-100 text-purple-800';
      case 'video_call': return 'bg-blue-100 text-blue-800';
      case 'phone_call': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format participants
  const formatParticipants = (participants: Record<string, string> | null) => {
    if (!participants) return [];
    return Object.entries(participants).map(([name, role]) => ({ name, role }));
  };

  if (isLoading) {
    return (
      <PermissionWrapper roles={['super_admin']}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading meeting details...</div>
            </div>
          </div>
        </AdminLayout>
      </PermissionWrapper>
    );
  }

  if (error) {
    return (
      <PermissionWrapper roles={['super_admin']}>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading Meeting
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    There was an error loading the meeting details. Please try again.
                  </p>
                  <Button
                    onClick={handleBack}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Meetings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </PermissionWrapper>
    );
  }

  if (!meeting && !isLoading) {
    return (
      <PermissionWrapper roles={['super_admin']}>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    Meeting Not Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    The meeting with ID {meetingId} could not be found.
                  </p>
                  <div className="text-sm text-gray-400 mb-4">
                    <p>Response received: {meetingResponse ? 'Yes' : 'No'}</p>
                    <p>Success status: {isSuccess ? 'Yes' : 'No'}</p>
                    <p>Available meetings: {meetingResponse?.data?.meetings?.length || 0}</p>
                    <p>Looking for meeting ID: {meetingId}</p>
                    <p>Available meeting IDs: {meetingResponse?.data?.meetings?.map(m => m.id).join(', ') || 'None'}</p>
                  </div>
                  <Button
                    onClick={handleBack}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Meetings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </PermissionWrapper>
    );
  }

  // TypeScript assertion - we know meeting exists at this point
  const meetingData = meeting as NonNullable<typeof meeting>;

  return (
    <PermissionWrapper roles={['super_admin']}>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {meetingData.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Meeting Details
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Edit Meeting
                </Button>
              </div>
            </div>

            {/* Meeting Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(meetingData.meeting_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(meetingData.meeting_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{meetingData.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{meetingData.duration_minutes} minutes</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Status and Type */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Status & Type
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status</p>
                    <Badge className={getStatusColor(meetingData.status)}>
                      {meetingData.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Meeting Type</p>
                    <Badge className={getMeetingTypeColor(meetingData.meeting_type)}>
                      {meetingData.meeting_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Category</p>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {meetingData.category}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Participants */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Participants
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="font-medium">{meetingData.created_by?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium">{meetingData.assigned_employee?.name || 'N/A'}</p>
                    </div>
                  </div>
                  {meetingData.lead && (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Lead</p>
                        <p className="font-medium">{meetingData.lead.name}</p>
                        <p className="text-xs text-gray-400">{meetingData.lead.company_name}</p>
                      </div>
                    </div>
                  )}
                  {meetingData.client && (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <p className="font-medium">{meetingData.client.name}</p>
                        <p className="text-xs text-gray-400">{meetingData.client.company_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Description, Agenda and Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {meetingData.description || 'No description provided'}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Agenda
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {meetingData.agenda || 'No agenda provided'}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {meetingData.notes || 'No notes provided'}
                </p>
              </Card>
            </div>

            {/* Meeting Participants */}
            {meetingData.participants && Object.keys(meetingData.participants).length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Meeting Participants
                </h3>
                <div className="space-y-3">
                  {formatParticipants(meetingData.participants).map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{participant.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{participant.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Outcomes, Action Items, and Next Steps */}
            {(meetingData.outcomes || meetingData.action_items || meetingData.next_steps) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {meetingData.outcomes && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                      Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {meetingData.outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {meetingData.action_items && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Action Items
                    </h3>
                    <ul className="space-y-2">
                      {meetingData.action_items.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {meetingData.next_steps && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
                      Next Steps
                    </h3>
                    <ul className="space-y-2">
                      {meetingData.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span className="text-gray-600 dark:text-gray-400">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            {/* Attachments */}
            {(meetingData as any).attachments && (meetingData as any).attachments.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {(meetingData as any).attachments.map((attachment: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FileTextIcon className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{attachment.name || `Attachment ${index + 1}`}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{attachment.size || 'Unknown size'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </AdminLayout>
    </PermissionWrapper>
  );
}
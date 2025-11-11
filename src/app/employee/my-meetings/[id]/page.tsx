'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon, 
  RefreshIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  FileTextIcon,
  BuildingIcon
} from '@/components/ui/icons';
import { useEmployeeMeetingDetails } from '@/modules/employee-meetings';

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = Number(params.id);

  // Fetch meeting details
  const { 
    data: meetingResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeMeetingDetails(meetingId);

  // Get meeting data directly from response
  const meeting = meetingResponse?.data;

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  // Meeting status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      scheduled: { 
        label: 'Scheduled', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      },
      completed: { 
        label: 'Completed', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      },
      cancelled: { 
        label: 'Cancelled', 
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
      },
      rescheduled: { 
        label: 'Rescheduled', 
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Meeting type badge
  const getMeetingTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      in_person: { 
        label: 'In Person', 
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
      },
      video_call: { 
        label: 'Video Call', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      },
      phone_call: { 
        label: 'Phone Call', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      },
    };

    const config = typeConfig[type] || { 
      label: type, 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Meeting category badge
  const getCategoryBadge = (category: string) => {
    const categoryConfig: Record<string, { label: string; className: string }> = {
      lead: { 
        label: 'Lead', 
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
      },
      client: { 
        label: 'Client', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      },
      internal: { 
        label: 'Internal', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
      },
      management: { 
        label: 'Management', 
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
      },
    };

    const config = categoryConfig[category] || { 
      label: category, 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !meeting) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Meeting
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                {error?.message || 'Meeting not found'}
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RefreshIcon className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{meeting.title}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Meeting ID: #{meeting.id}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting Information */}
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  Meeting Information
                </h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {meeting.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{meeting.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                    <div className="mt-1">
                      {getMeetingTypeBadge(meeting.meeting_type)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(meeting.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <div className="mt-1">
                      {getCategoryBadge(meeting.category)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {meeting.duration_minutes} min
                    </p>
                  </div>
                </div>

                {meeting.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      Location
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {meeting.location}
                    </p>
                  </div>
                )}

                {meeting.agenda && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agenda</label>
                    <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                      {meeting.agenda}
                    </p>
                  </div>
                )}

                {meeting.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="mt-1 text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md whitespace-pre-wrap">
                      {meeting.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Date & Time
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Meeting Date</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(meeting.meeting_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      Meeting Time
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTime(meeting.meeting_time)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outcomes, Action Items, Next Steps */}
            {((meeting.outcomes && meeting.outcomes.length > 0) || 
              (meeting.action_items && meeting.action_items.length > 0) || 
              (meeting.next_steps && meeting.next_steps.length > 0)) && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    Meeting Results
                  </h2>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {meeting.outcomes && meeting.outcomes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Outcomes</label>
                      <ul className="mt-2 space-y-2">
                        {meeting.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                            <span className="text-gray-900 dark:text-white">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Action Items</label>
                      <ul className="mt-2 space-y-2">
                        {meeting.action_items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">▸</span>
                            <span className="text-gray-900 dark:text-white">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.next_steps && meeting.next_steps.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Steps</label>
                      <ul className="mt-2 space-y-2">
                        {meeting.next_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">→</span>
                            <span className="text-gray-900 dark:text-white">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            {meeting.participants && meeting.participants.length > 0 && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Participants ({meeting.participants.length})
                  </h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {meeting.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {participant.name}
                          </span>
                        </div>
                        {participant.role && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {participant.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {meeting.attachments && meeting.attachments.length > 0 && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    Attachments ({meeting.attachments.length})
                  </h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {meeting.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {attachment.file_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(attachment.file_size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.file_path, '_blank')}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Related Info */}
          <div className="space-y-6">
            {/* Lead Information */}
            {meeting.lead && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Lead
                  </h2>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="mt-1 text-gray-900 dark:text-white font-semibold">{meeting.lead.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BuildingIcon className="w-4 h-4" />
                      Company
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">{meeting.lead.company_name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Information */}
            {meeting.client && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BuildingIcon className="w-5 h-5" />
                    Client
                  </h2>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="mt-1 text-gray-900 dark:text-white font-semibold">{meeting.client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BuildingIcon className="w-4 h-4" />
                      Company
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">{meeting.client.company_name}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, CalendarIcon } from '@/components/ui/icons';
import { useEmployeeMeetings, useUpcomingMeetings } from '@/modules/employee-meetings';
import type { EmployeeMeeting } from '@/modules/employee-meetings';

export default function MyMeetingsPage() {
  const router = useRouter();

  // Fetch upcoming meetings
  const { data: upcomingResponse, isLoading: isLoadingUpcoming } = useUpcomingMeetings({ per_page: 15 });

  // Fetch all meetings list
  const { data: meetingsResponse, isLoading } = useEmployeeMeetings({ per_page: 15 });

  const upcomingMeetings = upcomingResponse?.data?.meetings || [];
  const meetings = meetingsResponse?.data?.meetings || [];

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

  // Handle view details
  const handleViewDetails = (meeting: EmployeeMeeting) => {
    router.push(`/employee/my-meetings/${meeting.id}`);
  };

  // Table columns
  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'meeting_date',
      label: 'Date',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'meeting_time',
      label: 'Time',
      render: (value: string) => formatTime(value),
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      render: (value: number) => `${value} min`,
    },
    {
      key: 'meeting_type',
      label: 'Type',
      render: (value: string) => getMeetingTypeBadge(value),
      filterable: true,
      filterOptions: [
        { label: 'In Person', value: 'in_person' },
        { label: 'Video Call', value: 'video_call' },
        { label: 'Phone Call', value: 'phone_call' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => getCategoryBadge(value),
      filterable: true,
      filterOptions: [
        { label: 'Lead', value: 'lead' },
        { label: 'Client', value: 'client' },
        { label: 'Internal', value: 'internal' },
        { label: 'Management', value: 'management' },
        { label: 'Periodic', value: 'periodic' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
      filterable: true,
      filterOptions: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Rescheduled', value: 'rescheduled' },
      ],
    },
    {
      key: 'lead',
      label: 'Lead/Client',
      render: (item: EmployeeMeeting) => {
        if (item.lead) {
          return (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {item.lead.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.lead.company_name}
              </div>
            </div>
          );
        }
        if (item.client) {
          return (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {item.client.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.client.company_name}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions' as const,
    },
  ];

  // Action buttons
  const actions = [
    {
      label: 'View Details',
      onClick: handleViewDetails,
      icon: EyeIcon,
      variant: 'ghost' as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your meetings</p>
        </div>
      </div>

      {/* All Meetings Table */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            All Meetings
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading meetings...</div>
              </div>
            </div>
          ) : (
            <DataTable
              data={meetings}
              columns={columns}
              actions={actions}
              searchable={true}
              searchPlaceholder="Search meetings..."
              filterable={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Meetings Section */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Upcoming Meetings
            </h2>
            {upcomingMeetings.length > 0 && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {upcomingMeetings.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingUpcoming ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading upcoming meetings...</div>
              </div>
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CalendarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Upcoming Meetings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                You don't have any scheduled meetings coming up.
              </p>
            </div>
          ) : (
            <DataTable
              data={upcomingMeetings}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}


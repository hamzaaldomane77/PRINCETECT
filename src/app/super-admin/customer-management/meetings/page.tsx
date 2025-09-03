'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';

// Mock data for meetings
const mockMeetings = [
  {
    id: 1,
    title: 'Project Kickoff Meeting',
    customerName: 'Advanced Technology Company',
    customerLogo: '/logo.png',
    date: '2025-08-15T10:00:00',
    endDate: '2025-08-15T11:30:00',
    location: 'Client Office',
    attendees: 'Ahmed Mohammed, Sara Ali, Omar Khalid',
    status: 'scheduled',
    type: 'in-person',
    priority: 'high',
    notes: 'Discuss project requirements and timeline'
  },
  {
    id: 2,
    title: 'System Requirements Review',
    customerName: 'Hope Hospital',
    customerLogo: '/logo.png',
    date: '2025-08-16T14:00:00',
    endDate: '2025-08-16T15:30:00',
    location: 'Virtual (Zoom)',
    attendees: 'Dr. Fatima Ali, Mohammed Abdullah, Layla Mansour',
    status: 'scheduled',
    type: 'virtual',
    priority: 'medium',
    notes: 'Review system requirements document'
  },
  {
    id: 3,
    title: 'Contract Negotiation',
    customerName: 'Future Bank',
    customerLogo: '/logo.png',
    date: '2025-08-12T09:30:00',
    endDate: '2025-08-12T11:00:00',
    location: 'Our Office',
    attendees: 'Mohammed Abdullah, Hassan Ibrahim',
    status: 'completed',
    type: 'in-person',
    priority: 'high',
    notes: 'Finalize contract terms and pricing'
  },
  {
    id: 4,
    title: 'Training Session',
    customerName: 'Knowledge University',
    customerLogo: '/logo.png',
    date: '2025-08-20T13:00:00',
    endDate: '2025-08-20T16:00:00',
    location: 'Client Campus',
    attendees: 'Dr. Khalid Hassan, Sara Ahmed, Omar Khalil',
    status: 'scheduled',
    type: 'in-person',
    priority: 'medium',
    notes: 'Train staff on new system features'
  },
  {
    id: 5,
    title: 'Quarterly Review',
    customerName: 'Modern Fashion Store',
    customerLogo: '/logo.png',
    date: '2025-08-10T11:00:00',
    endDate: '2025-08-10T12:30:00',
    location: 'Virtual (Teams)',
    attendees: 'Sara Ahmed, Layla Mansour',
    status: 'cancelled',
    type: 'virtual',
    priority: 'low',
    notes: 'Review quarterly performance metrics'
  },
  {
    id: 6,
    title: 'Product Demo',
    customerName: 'Green Energy Solutions',
    customerLogo: '/logo.png',
    date: '2025-08-18T15:30:00',
    endDate: '2025-08-18T17:00:00',
    location: 'Client Office',
    attendees: 'Omar Khalil, Hassan Ibrahim',
    status: 'scheduled',
    type: 'in-person',
    priority: 'high',
    notes: 'Demonstrate new product features'
  },
  {
    id: 7,
    title: 'Support Issue Discussion',
    customerName: 'Digital Marketing Agency',
    customerLogo: '/logo.png',
    date: '2025-08-11T10:00:00',
    endDate: '2025-08-11T11:00:00',
    location: 'Virtual (Zoom)',
    attendees: 'Layla Mansour, Ahmed Mohammed',
    status: 'completed',
    type: 'virtual',
    priority: 'medium',
    notes: 'Discuss recent support tickets and solutions'
  },
  {
    id: 8,
    title: 'Project Planning',
    customerName: 'Construction Corp',
    customerLogo: '/logo.png',
    date: '2025-08-19T09:00:00',
    endDate: '2025-08-19T12:00:00',
    location: 'Our Office',
    attendees: 'Hassan Ibrahim, Omar Khalil, Sara Ahmed',
    status: 'scheduled',
    type: 'in-person',
    priority: 'high',
    notes: 'Plan project phases and resource allocation'
  }
];

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  postponed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
};

const typeColors = {
  'in-person': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'virtual': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

export default function MeetingsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Customer Management', href: '/super-admin/customer-management' },
    { label: 'Meetings' }
  ];

  const handleCreateMeeting = () => {
    router.push('/super-admin/customer-management/meetings/create');
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'customerLogo', label: 'Logo', type: 'logo', width: '60px' },
    { key: 'title', label: 'Meeting Title', type: 'text', align: 'right' },
    { key: 'customerName', label: 'Customer', type: 'text', align: 'right' },
    { key: 'date', label: 'Start Date & Time', type: 'date', align: 'right' },
    { key: 'endDate', label: 'End Date & Time', type: 'date', align: 'right' },
    { key: 'location', label: 'Location', type: 'text', align: 'right' },
    { key: 'attendees', label: 'Attendees', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'badge', badgeColors: statusColors, align: 'center' },
    { key: 'type', label: 'Type', type: 'badge', badgeColors: typeColors, align: 'center' },
    { key: 'priority', label: 'Priority', type: 'badge', badgeColors: priorityColors, align: 'center' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Meeting',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (meeting) => {
        console.log('View meeting:', meeting.id);
        alert(`Viewing meeting with ID: ${meeting.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Meeting',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (meeting) => {
        console.log('Edit meeting:', meeting.id);
        alert(`Editing meeting with ID: ${meeting.id}`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Meeting',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: (meeting) => {
        console.log('Delete meeting:', meeting.id);
        if (window.confirm('Are you sure you want to delete this meeting?')) {
          alert(`Deleting meeting with ID: ${meeting.id}`);
        }
      }
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
              <DataTable
                data={mockMeetings}
                columns={columns}
                actions={actions}
                searchable={true}
                searchPlaceholder="Search meetings..."
                filterable={false}
                selectable={true}
                pagination={true}
                defaultItemsPerPage={5}
                onSelectionChange={handleSelectionChange}
                onSearch={handleSearch}
                onFilter={handleFilter}
                className="flex-1 flex flex-col min-h-0"
              />
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
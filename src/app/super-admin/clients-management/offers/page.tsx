'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';

// Mock data based on the screenshot
const mockOffers = [
  {
    id: 1,
    quotationNumber: 'QT-2025-001',
    title: 'Digital Marketing Services Offer',
    customer: 'Knowledge University',
    relatedMeeting: 'Project Kickoff Meeting',
    totalAmount: 'SAR 14,250.00',
    finalAmount: 'SAR 14,250.00',
    status: 'sent',
    validUntil: '2025-08-25T00:00:00',
    createdAt: '2025-07-26T19:38:02'
  },
  {
    id: 2,
    quotationNumber: 'QT-2025-002',
    title: 'Website Development Offer',
    customer: 'Hope Hospital',
    relatedMeeting: 'System Requirements Review',
    totalAmount: 'SAR 26,250.00',
    finalAmount: 'SAR 26,250.00',
    status: 'sent',
    validUntil: '2025-08-16T00:00:00',
    createdAt: '2025-07-26T19:40:30'
  },
  {
    id: 3,
    quotationNumber: 'QT-2025-003',
    title: 'Social Media Management Offer',
    customer: 'Knowledge University',
    relatedMeeting: 'Contract Negotiation',
    totalAmount: 'SAR 7,600.00',
    finalAmount: 'SAR 7,600.00',
    status: 'accepted',
    validUntil: '2025-08-10T00:00:00',
    createdAt: '2025-07-26T19:40:30'
  },
  {
    id: 4,
    quotationNumber: 'QT-2025-004',
    title: 'Marine Design Services Offer',
    customer: 'Hope Hospital',
    relatedMeeting: 'Project Planning',
    totalAmount: 'SAR 12,600.00',
    finalAmount: 'SAR 12,600.00',
    status: 'draft',
    validUntil: '2025-08-05T00:00:00',
    createdAt: '2025-07-26T19:40:30'
  },
  {
    id: 5,
    quotationNumber: 'QT-2025-005',
    title: 'Marketing Consultation Services Offer',
    customer: 'Modern Fashion Store',
    relatedMeeting: 'Support Issue Discussion',
    totalAmount: 'SAR 5,250.00',
    finalAmount: 'SAR 5,250.00',
    status: 'rejected',
    validUntil: '2025-07-21T00:00:00',
    createdAt: '2025-07-26T19:40:30'
  }
];

const statusColors: Record<string, string> = {
  sent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function OffersPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Offers' }
  ];

  const handleCreateOffer = () => {
    // Future: route to create offer page
    alert('Create Offer functionality coming soon');
  };

  // Define table columns – ordered similar to screenshot
  const columns: Column[] = [
    { key: 'quotationNumber', label: 'Quotation No.', type: 'text', align: 'right' },
    { key: 'title', label: 'Quotation Title', type: 'text', align: 'right' },
    { key: 'customer', label: 'Customer', type: 'text', align: 'right' },
    { key: 'relatedMeeting', label: 'Related Meeting', type: 'text', align: 'right' },
    { key: 'totalAmount', label: 'Total Amount', type: 'text', align: 'right' },
    { key: 'finalAmount', label: 'Final Amount', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'badge', badgeColors: statusColors, align: 'center' },
    { key: 'validUntil', label: 'Valid Until', type: 'date', align: 'right' },
    { key: 'createdAt', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Offer',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (offer) => {
        console.log('View offer:', offer.id);
        alert(`Viewing offer ${offer.quotationNumber}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Offer',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (offer) => {
        console.log('Edit offer:', offer.id);
        alert(`Editing offer ${offer.quotationNumber}`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Offer',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: (offer) => {
        console.log('Delete offer:', offer.id);
        if (window.confirm('Are you sure you want to delete this offer?')) {
          alert(`Deleting offer ${offer.quotationNumber}`);
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offers Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Create and manage customer offers</p>
              </div>
              <Button onClick={handleCreateOffer} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Create Offer</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              <DataTable
                data={mockOffers}
                columns={columns}
                actions={actions}
                searchable={true}
                searchPlaceholder="Search offers..."
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
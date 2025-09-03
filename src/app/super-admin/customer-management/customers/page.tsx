'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/ui/icons';

// Mock data for customers
const mockCustomers = [
  {
    id: 1,
    logo: '/logo.png',
    clientName: 'Advanced Technology Company',
    companyName: 'Advanced Technology Software Company',
    responsiblePerson: 'Ahmed Mohammed',
    phone: '+966501234567',
    email: 'ahmed@techcompany.com',
    industry: 'technology',
    size: 'medium',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 2,
    logo: '/logo.png',
    clientName: 'Hope Hospital',
    companyName: 'Hope Specialist Hospital',
    responsiblePerson: 'Dr. Fatima Ali',
    phone: '+966502345678',
    email: 'fatima@hopehospital.com',
    industry: 'healthcare',
    size: 'large',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 3,
    logo: '/logo.png',
    clientName: 'Future Bank',
    companyName: 'Future Islamic Bank',
    responsiblePerson: 'Mohammed Abdullah',
    phone: '+966503456789',
    email: 'mohammed@futurebank.com',
    industry: 'finance',
    size: 'enterprise',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 4,
    logo: '/logo.png',
    clientName: 'Knowledge University',
    companyName: 'National Knowledge University',
    responsiblePerson: 'Dr. Khalid Hassan',
    phone: '+966504567890',
    email: 'khalid@knowledgeuniversity.com',
    industry: 'education',
    size: 'large',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 5,
    logo: '/logo.png',
    clientName: 'Modern Fashion Store',
    companyName: 'Modern Fashion Trading Store',
    responsiblePerson: 'Sara Ahmed',
    phone: '+966505678901',
    email: 'sara@modernfashion.com',
    industry: 'retail',
    size: 'medium',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 6,
    logo: '/logo.png',
    clientName: 'Green Energy Solutions',
    companyName: 'Green Energy Solutions Ltd',
    responsiblePerson: 'Omar Khalil',
    phone: '+966506789012',
    email: 'omar@greenenergy.com',
    industry: 'energy',
    size: 'large',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 7,
    logo: '/logo.png',
    clientName: 'Digital Marketing Agency',
    companyName: 'Digital Marketing Pro Agency',
    responsiblePerson: 'Layla Mansour',
    phone: '+966507890123',
    email: 'layla@digitalmarketing.com',
    industry: 'marketing',
    size: 'small',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  },
  {
    id: 8,
    logo: '/logo.png',
    clientName: 'Construction Corp',
    companyName: 'Modern Construction Corporation',
    responsiblePerson: 'Hassan Ibrahim',
    phone: '+966508901234',
    email: 'hassan@construction.com',
    industry: 'construction',
    size: 'enterprise',
    isActive: true,
    createdAt: '2025-07-26T15:57:33',
    associatedPotentialClient: null
  }
];

const industryColors = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  education: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  retail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  energy: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  construction: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const sizeColors = {
  small: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  large: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enterprise: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export default function CustomersPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Customer Management', href: '/super-admin/customer-management' },
    { label: 'Customers' }
  ];

  const handleCreateCustomer = () => {
    router.push('/super-admin/customer-management/customers/create');
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'logo', label: 'Logo', type: 'logo', width: '60px' },
    { key: 'clientName', label: 'Client Name', type: 'text', align: 'right' },
    { key: 'companyName', label: 'Company Name', type: 'text', align: 'right' },
    { key: 'responsiblePerson', label: 'Responsible Person', type: 'text', align: 'right' },
    { key: 'phone', label: 'Phone', type: 'text', align: 'right' },
    { key: 'email', label: 'Email', type: 'text', align: 'right' },
    { key: 'associatedPotentialClient', label: 'Associated Potential Client', type: 'text', align: 'right' },
    { key: 'industry', label: 'Industry', type: 'badge', badgeColors: industryColors, align: 'center' },
    { key: 'size', label: 'Size', type: 'badge', badgeColors: sizeColors, align: 'center' },
    { key: 'isActive', label: 'Active', type: 'icon', align: 'center' },
    { key: 'createdAt', label: 'Date of Creation', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Customer',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (customer) => {
        console.log('View customer:', customer.id);
        alert(`Viewing customer with ID: ${customer.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Customer',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (customer) => {
        console.log('Edit customer:', customer.id);
        alert(`Editing customer with ID: ${customer.id}`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Customer',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: (customer) => {
        console.log('Delete customer:', customer.id);
        if (window.confirm('Are you sure you want to delete this customer?')) {
          alert(`Deleting customer with ID: ${customer.id}`);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
            </div>
            
            {/* Create Customer Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateCustomer}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Customer</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              <DataTable
                data={mockCustomers}
                columns={columns}
                actions={actions}
                searchable={true}
                searchPlaceholder="Search customers..."
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
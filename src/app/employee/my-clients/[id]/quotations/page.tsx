'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { ArrowLeftIcon, RefreshIcon, EyeIcon, FileTextIcon } from '@/components/ui/icons';
import { useEmployeeClient, useClientQuotations, ClientQuotation } from '@/modules/employee-clients';
import { format } from 'date-fns';

interface ClientQuotationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function ClientQuotationsPage({ params }: ClientQuotationsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data: clientResponse, isLoading: isLoadingClient } = useEmployeeClient(clientId);
  const { data: quotationsResponse, isLoading: isLoadingQuotations, refetch } = useClientQuotations(clientId, page, perPage);

  const client = clientResponse?.data;
  const quotations = quotationsResponse?.data?.quotations || [];
  const meta = quotationsResponse?.meta || null;

  if (isNaN(clientId) || clientId <= 0) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Invalid Client ID
            </h3>
            <Button onClick={() => router.push('/employee/my-clients')}>
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingClient || isLoadingQuotations) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading quotations...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { 
      key: 'quotation_number', 
      label: 'Quotation Number', 
      type: 'text', 
      align: 'right' 
    },
    { 
      key: 'title', 
      label: 'Title', 
      type: 'text', 
      align: 'right' 
    },
    { 
      key: 'total_amount', 
      label: 'Total Amount', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge', 
      align: 'center',
      badgeColors: statusColors
    },
    { 
      key: 'valid_until', 
      label: 'Valid Until', 
      type: 'date', 
      align: 'center' 
    },
    { 
      key: 'created_at', 
      label: 'Created At', 
      type: 'date', 
      align: 'right' 
    },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Quotation',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (quotation: ClientQuotation) => {
        // Navigate to quotation details if available
        // For now, we'll just show a placeholder
        console.log('View quotation:', quotation.id);
      }
    },
  ];

  // Transform quotations data for the table
  const transformedQuotations = quotations.map(quotation => ({
    id: quotation.id,
    quotation_number: quotation.quotation_number,
    title: quotation.title,
    total_amount: `${parseFloat(quotation.total_amount).toLocaleString()} ${quotation.currency}`,
    status: quotation.status || 'draft',
    valid_until: quotation.valid_until,
    created_at: quotation.created_at,
  }));

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => router.push(`/employee/my-clients/${clientId}`)} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Client
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Quotations</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {client?.name} • {client?.company_name || 'No Company'}
              </p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quotations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {quotations.length > 0 ? (
              <DataTable
                data={transformedQuotations}
                columns={columns}
                actions={actions}
                searchable={false}
                filterable={false}
                selectable={false}
                pagination={true}
                defaultItemsPerPage={perPage}
                serverSide={true}
                currentPage={meta?.current_page || 1}
                totalPages={meta?.last_page || 1}
                totalItems={meta?.total || 0}
                itemsPerPage={meta?.per_page || perPage}
                onPageChange={(newPage) => setPage(newPage)}
                onItemsPerPageChange={(newPerPage) => {
                  setPerPage(newPerPage);
                  setPage(1);
                }}
                className="flex-1 flex flex-col min-h-0"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Quotations Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This client doesn't have any quotations yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotations Details */}
        {quotations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      <span>{quotation.title}</span>
                    </div>
                    <Badge className={statusColors[quotation.status as keyof typeof statusColors] || statusColors.draft}>
                      {quotation.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quotation Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{quotation.quotation_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {parseFloat(quotation.total_amount).toLocaleString()} {quotation.currency}
                      </p>
                    </div>
                    {quotation.subtotal && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(quotation.subtotal).toLocaleString()} {quotation.currency}
                        </p>
                      </div>
                    )}
                    {quotation.tax_amount && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tax Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(quotation.tax_amount).toLocaleString()} {quotation.currency}
                        </p>
                      </div>
                    )}
                    {quotation.discount_amount && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Discount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(quotation.discount_amount).toLocaleString()} {quotation.currency}
                        </p>
                      </div>
                    )}
                    {quotation.valid_until && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Valid Until</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(quotation.valid_until), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {quotation.assigned_employee && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p className="font-medium text-gray-900 dark:text-white">{quotation.assigned_employee.name}</p>
                      </div>
                    )}
                    {quotation.created_at && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(quotation.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  {quotation.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{quotation.description}</p>
                    </div>
                  )}
                  {quotation.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{quotation.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


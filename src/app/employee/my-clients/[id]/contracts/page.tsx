'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { ArrowLeftIcon, RefreshIcon, EyeIcon, FileTextIcon, WorkflowIcon, PdaDocumentsIcon } from '@/components/ui/icons';
import { useEmployeeClient, useClientContracts, ClientContract } from '@/modules/employee-clients';
import { format } from 'date-fns';

interface ClientContractsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function ClientContractsPage({ params }: ClientContractsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { data: clientResponse, isLoading: isLoadingClient } = useEmployeeClient(clientId);
  const { data: contractsResponse, isLoading: isLoadingContracts, refetch } = useClientContracts(clientId, page, perPage);

  const client = clientResponse?.data;
  const contracts = contractsResponse?.data?.contracts || [];
  const meta = contractsResponse?.meta || null;

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

  if (isLoadingClient || isLoadingContracts) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading contracts...</div>
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
      key: 'contract_number', 
      label: 'Contract Number', 
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
      key: 'start_date', 
      label: 'Start Date', 
      type: 'date', 
      align: 'center' 
    },
    { 
      key: 'end_date', 
      label: 'End Date', 
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
      label: 'View Contract',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (contract: ClientContract) => {
        router.push(`/employee/my-contracts/${contract.id}`);
      }
    },
    {
      icon: WorkflowIcon,
      label: 'View Services',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
      onClick: (contract: ClientContract) => {
        router.push(`/employee/my-contracts/${contract.id}/services`);
      }
    },
    {
      icon: PdaDocumentsIcon,
      label: 'View Tasks',
      color: 'text-indigo-600 dark:text-indigo-400',
      hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900',
      onClick: (contract: ClientContract) => {
        router.push(`/employee/my-contracts/${contract.id}/tasks`);
      }
    },
  ];

  // Transform contracts data for the table
  const transformedContracts = contracts.map(contract => ({
    id: contract.id,
    contract_number: contract.contract_number,
    title: contract.title,
    total_amount: `${parseFloat(contract.total_amount).toLocaleString()} ${contract.currency}`,
    status: contract.status || 'active',
    start_date: contract.start_date,
    end_date: contract.end_date,
    created_at: contract.created_at,
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Contracts</h1>
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

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contracts ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length > 0 ? (
              <DataTable
                data={transformedContracts}
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
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Contracts Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This client doesn't have any contracts yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts Details */}
        {contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      <span>{contract.title}</span>
                    </div>
                    <Badge className={statusColors[contract.status as keyof typeof statusColors] || statusColors.active}>
                      {contract.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contract Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.contract_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {parseFloat(contract.total_amount).toLocaleString()} {contract.currency}
                      </p>
                    </div>
                    {contract.advance_payment && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Advance Payment</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(contract.advance_payment).toLocaleString()} {contract.currency}
                        </p>
                      </div>
                    )}
                    {contract.remaining_amount && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(contract.remaining_amount).toLocaleString()} {contract.currency}
                        </p>
                      </div>
                    )}
                    {contract.start_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(contract.start_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {contract.end_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {contract.payment_terms && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                        <p className="font-medium text-gray-900 dark:text-white">{contract.payment_terms}</p>
                      </div>
                    )}
                    {contract.contract_type && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contract Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{contract.contract_type}</p>
                      </div>
                    )}
                    {contract.project_manager && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Project Manager</p>
                        <p className="font-medium text-gray-900 dark:text-white">{contract.project_manager.name}</p>
                      </div>
                    )}
                    {contract.created_at && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  {contract.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{contract.description}</p>
                    </div>
                  )}
                  {contract.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{contract.notes}</p>
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


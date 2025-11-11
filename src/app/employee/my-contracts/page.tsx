'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon, WorkflowIcon, PdaDocumentsIcon } from '@/components/ui/icons';
import { 
  useEmployeeContracts,
  EmployeeContract 
} from '@/modules/employee-contracts';
import { useLeadClients } from '@/modules/employee-leads';
import { useEmployeeLeads } from '@/modules/employee-leads';
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const contractTypeColors = {
  service_subscription: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  one_time_project: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export default function MyContractsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  
  // Filter states
  const [filters, setFilters] = useState<{
    q?: string;
    status?: string;
    contract_type?: string;
    payment_terms?: string;
    currency?: string;
    client_id?: number;
    lead_id?: number;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }>({
    q: '',
    status: '',
    contract_type: '',
    payment_terms: '',
    currency: '',
    client_id: undefined,
    lead_id: undefined,
    is_active: undefined,
    per_page: 15,
    page: 1
  });

  // Fetch lookup data for filters
  const { data: clientsData } = useLeadClients();
  const { data: leadsResponse } = useEmployeeLeads({ per_page: 1000 }); // Get all leads for filter
  const leads = leadsResponse?.data?.leads || [];

  // Fetch contracts
  const { 
    data: contractsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeContracts(filters);

  const contracts = contractsResponse?.data?.contracts || [];
  const meta = contractsResponse?.meta || null;

  const handleRetry = () => {
    refetch();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 1 };
      
      if (key === 'client_id' || key === 'lead_id') {
        newFilters[key as 'client_id' | 'lead_id'] = value ? parseInt(value) : undefined;
      } else if (key === 'is_active') {
        newFilters.is_active = value === 'true' ? true : value === 'false' ? false : undefined;
      } else if (key === 'per_page') {
        newFilters.per_page = value ? parseInt(value) : 15;
      } else if (key === 'page') {
        newFilters.page = value ? parseInt(value) : 1;
      } else {
        (newFilters as any)[key] = value || undefined;
      }
      
      return newFilters;
    });
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({
      ...prev,
      q: query,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      q: '',
      status: '',
      contract_type: '',
      payment_terms: '',
      currency: '',
      client_id: undefined,
      lead_id: undefined,
      is_active: undefined,
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.q ||
      filters.status ||
      filters.contract_type ||
      filters.payment_terms ||
      filters.currency ||
      filters.client_id ||
      filters.lead_id ||
      filters.is_active !== undefined
    );
  };

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
      key: 'client_name', 
      label: 'Client/Lead', 
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
      key: 'contract_type', 
      label: 'Type', 
      type: 'badge', 
      align: 'center',
      badgeColors: contractTypeColors
    },
    { key: 'start_date', label: 'Start Date', type: 'date', align: 'center' },
    { key: 'end_date', label: 'End Date', type: 'date', align: 'center' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Contract',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (contract: EmployeeContract) => {
        router.push(`/employee/my-contracts/${contract.id}`);
      }
    },
    {
      icon: WorkflowIcon,
      label: 'View Services',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
      onClick: (contract: EmployeeContract) => {
        router.push(`/employee/my-contracts/${contract.id}/services`);
      }
    },
    {
      icon: PdaDocumentsIcon,
      label: 'View Tasks',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (contract: EmployeeContract) => {
        router.push(`/employee/my-contracts/${contract.id}/tasks`);
      }
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  // Transform contracts data for the table
  const transformedContracts = contracts.map(contract => ({
    id: contract.id,
    contract_number: contract.contract_number,
    title: contract.title,
    client_name: contract.client?.name || contract.lead?.name || contract.client?.company_name || contract.lead?.company_name || '-',
    total_amount: `${formatCurrency(parseFloat(contract.total_amount))} ${contract.currency}`,
    status: contract.status || 'active',
    contract_type: contract.contract_type || 'one_time_project',
    start_date: contract.start_date,
    end_date: contract.end_date,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading contracts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && error) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your contracts</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Contracts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {error?.message || 'Something went wrong while loading contracts.'}
              </p>
              <Button onClick={handleRetry} className="mt-2">
                <RefreshIcon className="mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track your contracts</p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                {hasActiveFilters() && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters() && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
                <Button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {isFiltersOpen ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show Filters
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {isFiltersOpen && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search (Title, Contract Number, Description)</Label>
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={filters.q || ''}
                      onChange={(e) => handleFilterChange('q', e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contract Type */}
                  <div className="space-y-2">
                    <Label htmlFor="contract_type">Contract Type</Label>
                    <Select value={filters.contract_type} onValueChange={(value) => handleFilterChange('contract_type', value)}>
                      <SelectTrigger id="contract_type">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service_subscription">Service Subscription</SelectItem>
                        <SelectItem value="one_time_project">One Time Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Terms */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select value={filters.payment_terms} onValueChange={(value) => handleFilterChange('payment_terms', value)}>
                      <SelectTrigger id="payment_terms">
                        <SelectValue placeholder="All Payment Terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upfront">Upfront</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="All Currencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client */}
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Filter by Client</Label>
                    <Select 
                      value={filters.client_id ? String(filters.client_id) : undefined}
                      onValueChange={(value) => handleFilterChange('client_id', value)}
                    >
                      <SelectTrigger id="client_id">
                        <SelectValue placeholder="All Clients" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsData?.data?.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.name} {client.company_name ? `- ${client.company_name}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead */}
                  <div className="space-y-2">
                    <Label htmlFor="lead_id">Filter by Lead</Label>
                    <Select 
                      value={filters.lead_id ? String(filters.lead_id) : undefined}
                      onValueChange={(value) => handleFilterChange('lead_id', value)}
                    >
                      <SelectTrigger id="lead_id">
                        <SelectValue placeholder="All Leads" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={String(lead.id)}>
                            {lead.name} {lead.company_name ? `- ${lead.company_name}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Is Active */}
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Is Active</Label>
                    <Select value={filters.is_active !== undefined ? (filters.is_active ? 'true' : 'false') : ''} onValueChange={(value) => handleFilterChange('is_active', value)}>
                      <SelectTrigger id="is_active">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <div className="flex-1 flex flex-col min-h-0">
          {contracts.length > 0 ? (
            <DataTable
              data={transformedContracts}
              columns={columns}
              actions={actions}
              searchable={true}
              searchPlaceholder="Search contracts..."
              filterable={false}
              selectable={true}
              pagination={true}
              defaultItemsPerPage={filters.per_page}
              serverSide={true}
              currentPage={meta?.current_page || 1}
              totalPages={meta?.last_page || 1}
              totalItems={meta?.total || 0}
              itemsPerPage={meta?.per_page || filters.per_page}
              onPageChange={(page) => handleFilterChange('page', String(page))}
              onItemsPerPageChange={(perPage) => handleFilterChange('per_page', String(perPage))}
              onSelectionChange={handleSelectionChange}
              onSearch={handleSearch}
              className="flex-1 flex flex-col min-h-0"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Contracts Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  You don't have any contracts assigned at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


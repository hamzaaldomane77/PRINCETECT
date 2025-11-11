'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon, WorkflowIcon } from '@/components/ui/icons';
import { 
  useEmployeeQuotations,
  useQuotationClients,
  useQuotationLeads,
  useQuotationStatuses,
  EmployeeQuotation 
} from '@/modules/employee-quotations';
import { format } from 'date-fns';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  modified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function MyQuotationsPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  
  // Filter states
  const [filters, setFilters] = useState<{
    q?: string;
    status?: string;
    lead_id?: number;
    client_id?: number;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }>({
    q: '',
    status: '',
    lead_id: undefined,
    client_id: undefined,
    is_active: undefined,
    per_page: 15,
    page: 1
  });

  // Fetch lookup data for filters
  const { data: clientsData } = useQuotationClients();
  const { data: leadsData } = useQuotationLeads();
  const { data: statusesData } = useQuotationStatuses();

  // Fetch quotations
  const { 
    data: quotationsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeQuotations(filters);

  const quotations = quotationsResponse?.data?.quotations || [];
  const meta = quotationsResponse?.meta || null;

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

  const handleClearFilters = () => {
    setFilters({
      q: '',
      status: '',
      lead_id: undefined,
      client_id: undefined,
      is_active: undefined,
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.q ||
      filters.status ||
      filters.lead_id ||
      filters.client_id ||
      filters.is_active !== undefined
    );
  };

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
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center', width: '100px' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Quotation',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (quotation: EmployeeQuotation) => {
        router.push(`/employee/my-quotations/${quotation.id}`);
      }
    },
    {
      icon: WorkflowIcon,
      label: 'View Services',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
      onClick: (quotation: EmployeeQuotation) => {
        router.push(`/employee/my-quotations/${quotation.id}/services`);
      }
    },
  ];

  // Transform quotations data for the table
  const transformedQuotations = quotations.map(quotation => ({
    id: quotation.id,
    quotation_number: quotation.quotation_number,
    title: quotation.title,
    client_name: quotation.client?.name || quotation.lead?.name || quotation.client?.company_name || quotation.lead?.company_name || '-',
    total_amount: `${parseFloat(quotation.total_amount).toLocaleString()} ${quotation.currency}`,
    status: quotation.status || 'draft',
    valid_until: quotation.valid_until,
    created_at: quotation.created_at,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading quotations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotations</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your quotations</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Quotations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {error?.message || 'Something went wrong while loading quotations.'}
              </p>
              <Button onClick={() => refetch()} className="mt-2">
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
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotations</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track your quotations</p>
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
                  {/* Search - q */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search (Title, Quotation Number, Description)</Label>
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={filters.q || ''}
                      onChange={(e) => handleFilterChange('q', e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Filter by Status</Label>
                    <Select 
                      value={filters.status || undefined} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusesData?.data?.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
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
                            {client.name} {client.company_name ? `(${client.company_name})` : ''}
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
                        {leadsData?.data?.map((lead) => (
                          <SelectItem key={lead.id} value={String(lead.id)}>
                            {lead.name} {lead.company_name ? `(${lead.company_name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Is Active */}
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Filter by Active Status</Label>
                    <Select 
                      value={filters.is_active !== undefined ? String(filters.is_active) : undefined}
                      onValueChange={(value) => handleFilterChange('is_active', value)}
                    >
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

        {/* Quotations Table */}
        {quotations.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={transformedQuotations}
                columns={columns}
                actions={actions}
                searchable={false}
                filterable={false}
                selectable={false}
                pagination={true}
                defaultItemsPerPage={filters.per_page}
                serverSide={true}
                currentPage={meta?.current_page || 1}
                totalPages={meta?.last_page || 1}
                totalItems={meta?.total || 0}
                itemsPerPage={meta?.per_page || filters.per_page}
                onPageChange={(newPage) => handleFilterChange('page', String(newPage))}
                onItemsPerPageChange={(newPerPage) => {
                  handleFilterChange('per_page', String(newPerPage));
                }}
                className="flex-1 flex flex-col min-h-0"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                  <WorkflowIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Quotations Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  You don't have any quotations yet. Quotations will appear here once they are created.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


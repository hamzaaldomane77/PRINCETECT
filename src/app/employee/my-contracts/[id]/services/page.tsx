'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from '@/components/ui/icons';
import { useEmployeeContract, useContractServices } from '@/modules/employee-contracts';
import { format } from 'date-fns';

interface ContractServicesPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ContractServicesPage({ params }: ContractServicesPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<{
    q?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }>({
    q: '',
    status: '',
    per_page: 15,
    page: 1
  });

  const { data: contractResponse, isLoading: isLoadingContract } = useEmployeeContract(contractId);
  const { data: servicesResponse, isLoading: isLoadingServices, refetch } = useContractServices(contractId, filters);

  const contract = contractResponse?.data;
  const services = servicesResponse?.data?.services || [];
  const meta = servicesResponse?.meta || null;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 1 };
      
      if (key === 'per_page') {
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
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(filters.q || filters.status);
  };

  if (isNaN(contractId) || contractId <= 0) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Invalid Contract ID
            </h3>
            <Button onClick={() => router.push('/employee/my-contracts')}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingContract || isLoadingServices) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading services...</div>
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
      key: 'service_name', 
      label: 'Service', 
      type: 'text', 
      align: 'right' 
    },
    { 
      key: 'quantity', 
      label: 'Quantity', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'unit_price', 
      label: 'Unit Price', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'total_price', 
      label: 'Total Price', 
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
      key: 'delivery_date', 
      label: 'Delivery Date', 
      type: 'date', 
      align: 'center' 
    },
    { 
      key: 'workflow_status', 
      label: 'Workflow', 
      type: 'text', 
      align: 'center' 
    },
  ];

  // Transform services data for the table
  const transformedServices = services.map(service => ({
    id: service.id,
    service_name: service.service.name,
    quantity: service.quantity,
    unit_price: `${formatCurrency(parseFloat(service.unit_price))} ${service.service.currency}`,
    total_price: `${formatCurrency(parseFloat(service.total_price))} ${service.service.currency}`,
    status: service.status || 'pending',
    delivery_date: service.delivery_date,
    workflow_status: service.workflow ? service.workflow.status : 'No Workflow',
  }));

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => router.push(`/employee/my-contracts/${contractId}`)} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Contract
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contract Services</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {contract?.title} • {contract?.contract_number}
              </p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
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
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Services ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <DataTable
                data={transformedServices}
                columns={columns}
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
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Services Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This contract doesn't have any services assigned yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Details */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{service.service.name}</span>
                    <Badge className={statusColors[service.status as keyof typeof statusColors] || statusColors.pending}>
                      {service.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium text-gray-900 dark:text-white">{service.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unit Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(service.unit_price))} {service.service.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(service.total_price))} {service.service.currency}
                      </p>
                    </div>
                    {service.delivery_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(service.delivery_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  {service.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{service.description}</p>
                    </div>
                  )}
                  {service.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{service.notes}</p>
                    </div>
                  )}
                  {service.workflow && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Workflow Status</p>
                      <Badge>{service.workflow.status}</Badge>
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


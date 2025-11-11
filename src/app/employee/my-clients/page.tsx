'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon, UserPlusIcon, UsersIcon, FileTextIcon, WorkflowIcon } from '@/components/ui/icons';
import { 
  useEmployeeClients,
  useClientCities,
  useClientStatuses,
  EmployeeClient 
} from '@/modules/employee-clients';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function MyClientsPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  
  // Filter states
  const [filters, setFilters] = useState<{
    q?: string;
    status?: string;
    industry?: string;
    size?: string;
    city_id?: number;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }>({
    q: '',
    status: '',
    industry: '',
    size: '',
    city_id: undefined,
    is_active: undefined,
    per_page: 15,
    page: 1
  });

  // Fetch lookup data
  const { data: citiesData } = useClientCities();
  const { data: statusesData } = useClientStatuses();

  // Fetch clients
  const { 
    data: clientsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeClients(filters);

  const clients = clientsResponse?.data?.clients || [];
  const meta = clientsResponse?.meta || null;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 1 };
      
      if (key === 'city_id') {
        newFilters.city_id = value ? parseInt(value) : undefined;
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
      industry: '',
      size: '',
      city_id: undefined,
      is_active: undefined,
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.q ||
      filters.status ||
      filters.industry ||
      filters.size ||
      filters.city_id ||
      filters.is_active !== undefined
    );
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { 
      key: 'logo', 
      label: 'Client', 
      type: 'custom', 
      align: 'right',
      render: (client: any) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img 
            src={getImageUrl(client.logo_url)} 
            alt={`${client.name} logo`}
            className="w-8 h-8 object-contain rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-logo.svg';
            }}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
            {client.company_name && !client.company_name.startsWith('http') && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{client.company_name}</p>
            )}
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email', type: 'text', align: 'right' },
    { key: 'phone', label: 'Phone', type: 'text', align: 'center' },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge', 
      align: 'center',
      badgeColors: statusColors
    },
    { key: 'city', label: 'City', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center', width: '100px' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Client',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (client: EmployeeClient) => {
        router.push(`/employee/my-clients/${client.id}`);
      }
    },
    {
      icon: UsersIcon,
      label: 'View Leads',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
      onClick: (client: EmployeeClient) => {
        router.push(`/employee/my-clients/${client.id}/leads`);
      }
    },
    {
      icon: FileTextIcon,
      label: 'View Quotations',
      color: 'text-indigo-600 dark:text-indigo-400',
      hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900',
      onClick: (client: EmployeeClient) => {
        router.push(`/employee/my-clients/${client.id}/quotations`);
      }
    },
    {
      icon: WorkflowIcon,
      label: 'View Contracts',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (client: EmployeeClient) => {
        router.push(`/employee/my-clients/${client.id}/contracts`);
      }
    },
  ];

  // Transform clients data for the table
  const transformedClients = clients.map(client => ({
    id: client.id,
    logo_url: client.logo,
    name: client.name,
    company_name: client.company_name && !client.company_name.startsWith('http') ? client.company_name : '-',
    email: client.email,
    phone: client.phone || client.mobile || '-',
    status: client.status || 'active',
    city: client.city?.name || '-',
    created_at: client.created_at,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Clients</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and follow up with your clients</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Clients
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {error?.message || 'Something went wrong while loading clients.'}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Clients</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and follow up with your clients</p>
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
                    <Label htmlFor="search">Search (Name, Company, Email, Phone)</Label>
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

                  {/* City - city_id */}
                  <div className="space-y-2">
                    <Label htmlFor="city_id">Filter by City</Label>
                    <Select 
                      value={filters.city_id ? String(filters.city_id) : undefined}
                      onValueChange={(value) => handleFilterChange('city_id', value)}
                    >
                      <SelectTrigger id="city_id">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesData?.data?.map((city) => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Filter by Industry</Label>
                    <Select 
                      value={filters.industry || undefined} 
                      onValueChange={(value) => handleFilterChange('industry', value)}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <Label htmlFor="size">Filter by Company Size</Label>
                    <Select 
                      value={filters.size || undefined} 
                      onValueChange={(value) => handleFilterChange('size', value)}
                    >
                      <SelectTrigger id="size">
                        <SelectValue placeholder="All Sizes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
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

        {/* Clients Table */}
        {clients.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={transformedClients}
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
                  <UserPlusIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Clients Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  You don't have any clients yet. Clients will appear here once they are assigned to you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

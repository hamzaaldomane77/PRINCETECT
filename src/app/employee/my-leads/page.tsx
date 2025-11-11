'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon, UserCheckIcon } from '@/components/ui/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  useEmployeeLeads, 
  useDeleteLead,
  useConvertLeadToClient,
  useLeadCities,
  useLeadStatuses,
  useLeadPriorities,
  EmployeeLead 
} from '@/modules/employee-leads';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

const statusColors = {
  new: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  proposal_sent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  negotiation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function MyLeadsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<EmployeeLead | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<EmployeeLead | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  
  // Filter states
  const [filters, setFilters] = useState<{
    q?: string;
    status?: string;
    priority?: string;
    city_id?: number;
    source?: string;
    industry?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }>({
    q: '',
    status: '',
    priority: '',
    city_id: undefined,
    source: '',
    industry: '',
    is_active: undefined,
    per_page: 15,
    page: 1
  });

  // Fetch lookup data
  const { data: citiesData } = useLeadCities();
  const { data: statusesData } = useLeadStatuses();
  const { data: prioritiesData } = useLeadPriorities();

  // Fetch leads
  const { 
    data: leadsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeLeads(filters);

  const leads = leadsResponse?.data?.leads || [];
  const meta = leadsResponse?.meta || null;

  // Mutations
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLeadToClient();

  const handleCreateLead = () => {
    router.push('/employee/my-leads/create');
  };

  const handleRetry = () => {
    refetch();
  };

  const handleDeleteLead = (lead: EmployeeLead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      await deleteLeadMutation.mutateAsync(leadToDelete.id);
      toast.success('Lead deleted successfully!');
      refetch();
    } catch (error: any) {
      console.error('Failed to delete lead:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete lead. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleConvertLead = (lead: EmployeeLead) => {
    setLeadToConvert(lead);
    setConvertDialogOpen(true);
  };

  const confirmConvert = async () => {
    if (!leadToConvert) return;
    
    try {
      await convertLeadMutation.mutateAsync(leadToConvert.id);
      toast.success('Lead converted to client successfully!');
      setConvertDialogOpen(false);
      setLeadToConvert(null);
      refetch();
    } catch (error: any) {
      console.error('Failed to convert lead:', error);
      toast.error(error?.response?.data?.message || 'Failed to convert lead. Please try again.');
    }
  };

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
      priority: '',
      city_id: undefined,
      source: '',
      industry: '',
      is_active: undefined,
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.q ||
      filters.status ||
      filters.priority ||
      filters.city_id ||
      filters.source ||
      filters.industry ||
      filters.is_active !== undefined
    );
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { 
      key: 'logo', 
      label: 'Lead', 
      type: 'custom', 
      align: 'right',
      render: (lead: any) => (
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img 
            src={getImageUrl(lead.logo_url)} 
            alt={`${lead.name} logo`}
            className="w-8 h-8 object-contain rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-logo.svg';
            }}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
            {lead.company_name && !lead.company_name.startsWith('http') && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company_name}</p>
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
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'badge', 
      align: 'center',
      badgeColors: priorityColors
    },
    { key: 'city', label: 'City', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Lead',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (lead: EmployeeLead) => {
        router.push(`/employee/my-leads/${lead.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Lead',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (lead: EmployeeLead) => {
        router.push(`/employee/my-leads/${lead.id}/edit`);
      }
    },
    {
      icon: UserCheckIcon,
      label: 'Convert to Client',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
      onClick: handleConvertLead
    },
    {
      icon: TrashIcon,
      label: 'Delete Lead',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteLead
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  // Transform leads data for the table
  const transformedLeads = leads.map(lead => ({
    id: lead.id,
    logo_url: lead.logo,
    name: lead.name,
    company_name: lead.company_name && !lead.company_name.startsWith('http') ? lead.company_name : '-',
    email: lead.email,
    phone: lead.phone || lead.mobile || '-',
    status: lead.status || 'new',
    priority: lead.priority || 'medium',
    city: lead.city?.name || '-',
    created_at: lead.created_at,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your leads</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Leads
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {error?.message || 'Something went wrong while loading leads.'}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and follow up with your leads</p>
          </div>
          <Button onClick={handleCreateLead} className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Lead
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
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
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusesData?.data?.map((status) => (
                      <SelectItem key={status.value} value={status.value || ''}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioritiesData?.data?.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value || ''}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={filters.city_id ? String(filters.city_id) : undefined} onValueChange={(value) => handleFilterChange('city_id', value)}>
                  <SelectTrigger id="city">
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

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                  <SelectTrigger id="source">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={filters.industry} onValueChange={(value) => handleFilterChange('industry', value)}>
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
          {leads.length > 0 ? (
            <DataTable
              data={transformedLeads}
              columns={columns}
              actions={actions}
              searchable={true}
              searchPlaceholder="Search leads..."
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
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Leads Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  You don't have any leads assigned at the moment.
                </p>
                <Button onClick={handleCreateLead} className="bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Lead
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead &quot;{leadToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLeadMutation.isPending}
            >
              {deleteLeadMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to Client Confirmation Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheckIcon className="h-5 w-5 text-purple-600" />
              Convert to Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to convert the lead &quot;{leadToConvert?.name}&quot; to a client?
              <br />
              <span className="text-purple-600 font-medium">This action will move the lead to the clients list.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmConvert}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={convertLeadMutation.isPending}
            >
              {convertLeadMutation.isPending ? 'Converting...' : 'Convert to Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


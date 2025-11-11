'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { ArrowLeftIcon, RefreshIcon, EyeIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useEmployeeClient, useClientLeads, ClientLead } from '@/modules/employee-clients';
import { useDeleteLead } from '@/modules/employee-leads';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/image-utils';
import { toast } from 'sonner';
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

interface ClientLeadsPageProps {
  params: Promise<{
    id: string;
  }>;
}

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
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ClientLeadsPage({ params }: ClientLeadsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<ClientLead | null>(null);

  const { data: clientResponse, isLoading: isLoadingClient } = useEmployeeClient(clientId);
  const { data: leadsResponse, isLoading: isLoadingLeads, refetch } = useClientLeads(clientId, page, perPage);
  const deleteLeadMutation = useDeleteLead();

  const client = clientResponse?.data;
  const leads = leadsResponse?.data?.leads || [];
  const meta = leadsResponse?.meta || null;

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

  if (isLoadingClient || isLoadingLeads) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading leads...</div>
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
    { key: 'assigned_employee', label: 'Assigned To', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  const handleDeleteLead = (lead: ClientLead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      await deleteLeadMutation.mutateAsync(leadToDelete.id);
      toast.success('Lead deleted successfully!');
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Failed to delete lead:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete lead. Please try again.');
    }
  };

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Lead',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (lead: ClientLead) => {
        router.push(`/employee/my-leads/${lead.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Lead',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (lead: ClientLead) => {
        router.push(`/employee/my-leads/${lead.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Lead',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteLead
    },
  ];

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
    assigned_employee: lead.assigned_employee?.name || '-',
    created_at: lead.created_at,
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Leads</h1>
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

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <DataTable
                data={transformedLeads}
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
                  No Leads Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This client doesn't have any related leads.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Details */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{lead.name}</span>
                    <div className="flex gap-2">
                      <Badge className={statusColors[lead.status as keyof typeof statusColors] || statusColors.new}>
                        {lead.status}
                      </Badge>
                      <Badge className={priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.medium}>
                        {lead.priority}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {lead.company_name && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.company_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.email}</p>
                    </div>
                    {(lead.phone || lead.mobile) && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.phone || lead.mobile}</p>
                      </div>
                    )}
                    {lead.assigned_employee && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.assigned_employee.name}</p>
                      </div>
                    )}
                    {lead.city && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.city.name}</p>
                      </div>
                    )}
                    {lead.created_at && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  {lead.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <TrashIcon className="h-5 w-5 text-red-600" />
                Delete Lead
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the lead &quot;{leadToDelete?.name}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
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
      </div>
    </div>
  );
}


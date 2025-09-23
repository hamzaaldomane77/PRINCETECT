'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, CheckIcon, XIcon } from '@/components/ui/icons';
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
import { useClient, useDeleteClient } from '@/modules/clients';
import { toast } from 'sonner';
import { useState } from 'react';
import { getImageUrl } from '@/lib/image-utils';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { data: client, isLoading, error, refetch } = useClient(clientId);
  const deleteClientMutation = useDeleteClient();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Clients', href: '/super-admin/clients-management/clients' },
    { label: client?.name || 'Client Details' }
  ];

  const handleDelete = async () => {
    try {
      await deleteClientMutation.mutateAsync(clientId);
      toast.success('Client deleted successfully!');
      router.push('/super-admin/clients-management/clients');
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('Cannot delete')) {
        toast.error('Cannot delete this client because they have active relationships.');
      } else {
        toast.error('Failed to delete client. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading client details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Error Loading Client
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  {(error as Error).message}
                </p>
                <Button onClick={() => refetch()} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (!client) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  Client Not Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-center">
                  The client you are looking for does not exist or has been deleted.
                </p>
                <Button 
                  onClick={() => router.push('/super-admin/clients-management/clients')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Clients
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {client.logo && (
                  <img 
                    src={getImageUrl(client.logo, '/placeholder-logo.svg')} 
                    alt={`${client.name} logo`}
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-logo.svg';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    {getStatusBadge(client.status)}
                    <Badge variant={client.is_active ? "default" : "secondary"}>
                      {client.is_active ? (
                        <>
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => router.push(`/super-admin/clients-management/clients/${client.id}/edit`)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit Client
                </Button>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Name</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.company_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.position || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Number</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.registration_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.city?.name || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fax</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.fax || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.contact_person || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Position</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.contact_position || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{client.address || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.website ? (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {client.website}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.linkedin ? (
                          <a href={client.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.industry ? client.industry.charAt(0).toUpperCase() + client.industry.slice(1) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.size ? client.size.charAt(0).toUpperCase() + client.size.slice(1) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Annual Revenue</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.annual_revenue ? `$${parseFloat(client.annual_revenue).toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {client.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-900 dark:text-white">{client.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Side Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status & Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(client.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</label>
                      <div className="mt-1">
                        <Badge variant={client.is_active ? "default" : "secondary"}>
                          {client.is_active ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(client.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(client.updated_at)}</p>
                    </div>
                    {client.activated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Activated At</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(client.activated_at)}</p>
                      </div>
                    )}
                    {client.suspended_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspended At</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(client.suspended_at)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {client.preferences && client.preferences.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {client.preferences.map((preference) => (
                          <Badge key={preference} variant="secondary" className="mr-2 mb-2">
                            {preference.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {client.lead && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Associated Lead</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{client.lead.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Company: {client.lead.company_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Status: {client.lead.status}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the client &quot;{client.name}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteClientMutation.isPending}
              >
                {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, UserIcon, PhoneIcon, MailIcon, BuildingIcon, CalendarIcon, TagIcon, FileTextIcon, HashIcon, BriefcaseIcon, HomeIcon, DollarSignIcon, MapPinIcon, UsersIcon, StarIcon } from '@/components/ui/icons';
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
import { useEmployeeLead, useDeleteLead } from '@/modules/employee-leads';
import { getImageUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

interface LeadDetailsPageProps {
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
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function LeadDetailsPage({ params }: LeadDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = parseInt(resolvedParams.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isNaN(leadId) || leadId <= 0) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Invalid Lead ID
            </h3>
            <Button onClick={() => router.push('/employee/my-leads')}>
              Back to Leads
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { data: leadResponse, isLoading, error } = useEmployeeLead(leadId);
  const lead = leadResponse?.data;
  const deleteLeadMutation = useDeleteLead();

  const handleBack = () => {
    router.push('/employee/my-leads');
  };

  const handleEdit = () => {
    router.push(`/employee/my-leads/${leadId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
      toast.success('Lead deleted successfully!');
      router.push('/employee/my-leads');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete lead. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading lead details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Lead Not Found
              </h3>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Leads
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {lead.logo ? (
                <img
                  src={getImageUrl(lead.logo) || ''}
                  alt={lead.name}
                  className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg dark:border-gray-800"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {lead.name.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lead.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lead.company_name || 'Individual Lead'} • {lead.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <Badge className={statusColors[lead.status as keyof typeof statusColors] || statusColors.new}>
                    {lead.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <TagIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                  <Badge className={priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.medium}>
                    {lead.priority.toUpperCase()}
                  </Badge>
                </div>
                <StarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Meetings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{lead.meetings?.length || 0}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quotations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{lead.quotations?.length || 0}</p>
                </div>
                <FileTextIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lead.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HashIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lead.id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lead.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lead.phone || lead.mobile || 'Not provided'}
                    </p>
                  </div>

                  {lead.position && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lead.position}
                      </p>
                    </div>
                  )}

                  {lead.address && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lead.address}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            {lead.company_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lead.company_name}
                      </p>
                    </div>
                    {lead.industry && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</span>
                        <Badge>{lead.industry.toUpperCase()}</Badge>
                      </div>
                    )}
                    {lead.size && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</span>
                        <Badge>{lead.size.toUpperCase()}</Badge>
                      </div>
                    )}
                    {lead.annual_revenue && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Annual Revenue</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${parseFloat(lead.annual_revenue).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {lead.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Details */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.source && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</span>
                    <p className="text-gray-900 dark:text-white">{lead.source}</p>
                  </div>
                )}
                {lead.city && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">City</span>
                    <p className="text-gray-900 dark:text-white">{lead.city.name}</p>
                  </div>
                )}
                {lead.assigned_employee && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</span>
                    <p className="text-gray-900 dark:text-white">{lead.assigned_employee.name}</p>
                  </div>
                )}
                {lead.expected_value && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Value</span>
                    <p className="text-gray-900 dark:text-white">${parseFloat(lead.expected_value).toLocaleString()}</p>
                  </div>
                )}
                {lead.expected_closing_date && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Closing Date</span>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(lead.expected_closing_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {lead.budget && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</span>
                    <p className="text-gray-900 dark:text-white">${parseFloat(lead.budget).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Information */}
            {lead.client && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{lead.client.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lead.client.company_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lead.client.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead &quot;{lead.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


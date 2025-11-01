'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, UserIcon, PhoneIcon, MailIcon, BuildingIcon, CalendarIcon, TagIcon, FileTextIcon, HashIcon, BriefcaseIcon, HomeIcon, DollarSignIcon, MapPinIcon, UsersIcon, BoardIcon, StarIcon } from '@/components/ui/icons';
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
import { useLead, useDeleteLead } from '@/modules/leads';
import { getImageUrl, getEmployeePhotoUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

interface LeadDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  negotiation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const sourceColors = {
  website: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  social_media: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  referral: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cold_call: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  event: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  email: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const industryColors = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  education: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  retail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manufacturing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  services: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const sizeColors = {
  startup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  small: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  large: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enterprise: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export default function LeadDetailsPage({ params }: LeadDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = parseInt(resolvedParams.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if ID is valid
  if (isNaN(leadId) || leadId <= 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Invalid Lead ID
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4 text-center">
                  The lead ID provided is not valid.
                </p>
                <Button
                  onClick={() => router.push('/super-admin/clients-management/potential-clients')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Potential Clients
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Fetch lead data
  const {
    data: leadResponse,
    isLoading,
    error,
    refetch,
    isError,
    isPending,
    isRefetching
  } = useLead(leadId);

  const lead = leadResponse?.data;
  const deleteLeadMutation = useDeleteLead();

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Potential Clients', href: '/super-admin/clients-management/potential-clients' },
    { label: lead?.name || 'Lead Details' }
  ];

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.new;
  };

  // Function to get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  };

  // Function to get source badge color
  const getSourceBadgeColor = (source: string) => {
    return sourceColors[source as keyof typeof sourceColors] || sourceColors.other;
  };

  // Function to get industry badge color
  const getIndustryBadgeColor = (industry: string) => {
    return industryColors[industry as keyof typeof industryColors] || industryColors.other;
  };

  // Function to get size badge color
  const getSizeBadgeColor = (size: string) => {
    return sizeColors[size as keyof typeof sizeColors] || sizeColors.small;
  };

  const handleBack = () => {
    router.push('/super-admin/clients-management/potential-clients');
  };

  const handleEdit = () => {
    router.push(`/super-admin/clients-management/potential-clients/${leadId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
      toast.success('Lead deleted successfully!');
      router.push('/super-admin/clients-management/potential-clients');
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'LEAD_HAS_RECORDS' || 
          errorMsg.includes('existing records') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this lead because they have existing records in the system.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this lead.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Lead not found. They may have been already deleted.');
      } else {
        toast.error('Failed to delete lead. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading || isPending) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading lead details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !lead) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Lead Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested lead could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Potential Clients
                  </Button>
                </div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              
                {/* Lead Avatar */}
                <div className="flex items-center space-x-4">
                  {lead.logo ? (
                    <img
                      src={getImageUrl(lead.logo) || ''}
                      alt={lead.name}
                      className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg dark:border-gray-800"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg ${lead.logo ? 'hidden' : 'flex'}`}
                  >
                    {lead.name
                      .split(' ')
                      .map((word: string) => word.charAt(0))
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {lead.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {lead.company_name || 'Individual Lead'} • {lead.status.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lead ID: {lead.id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <Badge className={getStatusBadgeColor(lead.status)}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <TagIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                      <Badge className={getPriorityBadgeColor(lead.priority)}>
                        {lead.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <StarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
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

              <Card className="dark:bg-gray-800 dark:border-gray-700">
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
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Core lead details and personal information
                    </CardDescription>
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
                <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Lead company details and business information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lead.company_name && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lead.company_name}
                          </p>
                        </div>
                      )}
                      {lead.industry && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Industry</span>
                          <Badge className={getIndustryBadgeColor(lead.industry)}>
                            {lead.industry.toUpperCase()}
                          </Badge>
                        </div>
                      )}
                      {lead.size && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</span>
                          <Badge className={getSizeBadgeColor(lead.size)}>
                            {lead.size.toUpperCase()}
                          </Badge>
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
                    
                    {(lead.website || lead.linkedin) && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Online Presence</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lead.website && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</span>
                              <a 
                                href={lead.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                              >
                                {lead.website}
                              </a>
                            </div>
                          )}
                          {lead.linkedin && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</span>
                              <a 
                                href={lead.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lead Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5" />
                      Lead Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Lead status, priority, and source information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                        <Badge className={getStatusBadgeColor(lead.status)}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
                        <Badge className={getPriorityBadgeColor(lead.priority)}>
                          {lead.priority.toUpperCase()}
                        </Badge>
                      </div>
                      {lead.source && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</span>
                          <Badge className={getSourceBadgeColor(lead.source)}>
                            {lead.source.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      )}
                      {lead.assigned_employee && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</span>
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {lead.assigned_employee.name}
                            </p>
                            {lead.assigned_employee.photo && (
                              <img 
                                src={getEmployeePhotoUrl(lead.assigned_employee.photo)} 
                                alt={`${lead.assigned_employee.name} photo`}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-employee.svg';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(lead.budget || lead.expected_value || lead.expected_closing_date) && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lead.budget && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</span>
                              <div className="flex items-center space-x-2">
                                <DollarSignIcon className="h-4 w-4 text-gray-500" />
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  ${parseFloat(lead.budget).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          {lead.expected_value && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Value</span>
                              <div className="flex items-center space-x-2">
                                <DollarSignIcon className="h-4 w-4 text-gray-500" />
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  ${parseFloat(lead.expected_value).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          {lead.expected_closing_date && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Closing Date</span>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {new Date(lead.expected_closing_date).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status and Metadata */}
              <div className="space-y-6">
                {/* Lead Summary Card */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Lead Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                      <Badge className={getStatusBadgeColor(lead.status)}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
                      <Badge className={getPriorityBadgeColor(lead.priority)}>
                        {lead.priority.toUpperCase()}
                      </Badge>
                    </div>
                    {lead.source && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</span>
                        <Badge className={getSourceBadgeColor(lead.source)}>
                          {lead.source.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    {lead.assigned_employee && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {lead.assigned_employee.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* City Information */}
                {lead.city && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">City</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lead.city.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timestamps */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(lead.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Information */}
                {lead.client && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Client Information
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Information about the converted client
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Name</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lead.client.name}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Client ID</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lead.client.id}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                          <Badge className={lead.client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                            {lead.client.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(lead.client.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Meetings */}
                {lead.meetings && lead.meetings.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="dark:text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-5 w-5 text-blue-600" />
                          <span>Meetings</span>
                          <Badge variant="secondary" className="ml-2">{lead.meetings.length}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lead.meetings.slice(0, 3).map((meeting) => (
                        <div key={meeting.id} className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {meeting.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {meeting.description}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <CalendarIcon className="h-3 w-3" />
                                  {new Date(meeting.meeting_date).toLocaleDateString('en-US')}
                                </span>
                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <BoardIcon className="h-3 w-3" />
                                  {meeting.duration_minutes}m
                                </span>
                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <MapPinIcon className="h-3 w-3" />
                                  {meeting.location || 'Online'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <Badge className={
                                meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                meeting.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }>
                                {meeting.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {meeting.meeting_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          {meeting.outcomes && meeting.outcomes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Outcomes:</h5>
                              <div className="flex flex-wrap gap-1">
                                {meeting.outcomes.slice(0, 2).map((outcome, outcomeIndex) => (
                                  <span key={outcomeIndex} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                    {outcome.length > 30 ? outcome.substring(0, 30) + '...' : outcome}
                                  </span>
                                ))}
                                {meeting.outcomes.length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{meeting.outcomes.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {lead.meetings.length > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            View {lead.meetings.length - 3} more meetings
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quotations */}
                {lead.quotations && lead.quotations.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="dark:text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5 text-green-600" />
                          <span>Quotations</span>
                          <Badge variant="secondary" className="ml-2">{lead.quotations.length}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lead.quotations.slice(0, 3).map((quotation) => (
                        <div key={quotation.id} className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {quotation.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">#{quotation.quotation_number}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {quotation.description}
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                  <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                    {quotation.currency} {parseFloat(quotation.total_amount).toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {new Date(quotation.valid_until).toLocaleDateString('en-US')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <Badge className={
                                quotation.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                quotation.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                quotation.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                quotation.status === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }>
                                {quotation.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(quotation.created_at).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Subtotal: {quotation.currency} {parseFloat(quotation.subtotal).toLocaleString()}</span>
                              <span>Tax: {quotation.tax_rate}%</span>
                              <span>Discount: {quotation.discount_rate}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {lead.quotations.length > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            View {lead.quotations.length - 3} more quotations
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Contracts */}
                {lead.contracts && lead.contracts.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="dark:text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5 text-purple-600" />
                          <span>Contracts</span>
                          <Badge variant="secondary" className="ml-2">{lead.contracts.length}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lead.contracts.slice(0, 3).map((contract) => (
                        <div key={contract.id} className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {contract.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">#{contract.contract_number}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {contract.description}
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Value:</span>
                                  <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                    {contract.currency} {parseFloat(contract.value).toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                    {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <Badge className={
                                contract.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                contract.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                contract.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                contract.status === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }>
                                {contract.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(contract.created_at).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Start: {new Date(contract.start_date).toLocaleDateString('en-US')}</span>
                              <span>End: {new Date(contract.end_date).toLocaleDateString('en-US')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {lead.contracts.length > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                            View {lead.contracts.length - 3} more contracts
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {lead.notes && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <FileTextIcon className="h-5 w-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {lead.notes}
                      </p>
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
                Are you sure you want to delete the lead "{lead?.name}"? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLeadMutation.isPending}
              >
                {deleteLeadMutation.isPending ? 'Deleting...' : 'Delete Lead'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Cannot Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}
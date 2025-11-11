'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, UserPlusIcon, UserIcon, PhoneIcon, MailIcon, BuildingIcon, CalendarIcon, MapPinIcon, DollarSignIcon, FileTextIcon } from '@/components/ui/icons';
import { useEmployeeClient } from '@/modules/employee-clients';
import { getImageUrl } from '@/lib/image-utils';
import { format } from 'date-fns';

interface ClientDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = parseInt(resolvedParams.id);

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

  const { data: clientResponse, isLoading, error } = useEmployeeClient(clientId);
  const client = clientResponse?.data;

  const handleBack = () => {
    router.push('/employee/my-clients');
  };

  const handleViewLeads = () => {
    router.push(`/employee/my-clients/${clientId}/leads`);
  };

  const handleViewQuotations = () => {
    router.push(`/employee/my-clients/${clientId}/quotations`);
  };

  const handleViewContracts = () => {
    router.push(`/employee/my-clients/${clientId}/contracts`);
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading client details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Client Not Found
              </h3>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Clients
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
              {client.logo ? (
                <img
                  src={getImageUrl(client.logo) || ''}
                  alt={client.name}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                {client.company_name && (
                  <p className="text-gray-600 dark:text-gray-400">{client.company_name}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {client.lead_id && (
              <Button onClick={handleViewLeads} variant="outline" size="sm">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                View Leads
              </Button>
            )}
            {(client.quotations && client.quotations.length > 0) && (
              <Button onClick={handleViewQuotations} variant="outline" size="sm">
                <FileTextIcon className="h-4 w-4 mr-2" />
                View Quotations ({client.quotations.length})
              </Button>
            )}
            {(client.contracts && client.contracts.length > 0) && (
              <Button onClick={handleViewContracts} variant="outline" size="sm">
                <FileTextIcon className="h-4 w-4 mr-2" />
                View Contracts ({client.contracts.length})
              </Button>
            )}
            <Badge className={statusColors[client.status] || statusColors.active}>
              {client.status}
            </Badge>
          </div>
        </div>

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MailIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.email}</p>
                </div>
              </div>
              {client.phone && (
                <div className="flex items-start gap-2">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.mobile && (
                <div className="flex items-start gap-2">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.mobile}</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.address}</p>
                  </div>
                </div>
              )}
              {client.city && (
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.city.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.company_name && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.company_name}</p>
                </div>
              )}
              {client.position && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.position}</p>
                </div>
              )}
              {client.registration_number && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Registration Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.registration_number}</p>
                </div>
              )}
              {client.industry && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{client.industry}</p>
                </div>
              )}
              {client.size && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{client.size}</p>
                </div>
              )}
              {client.website && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <a 
                    href={client.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {client.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.annual_revenue && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Annual Revenue</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {parseFloat(client.annual_revenue).toLocaleString()} SAR
                  </p>
                </div>
              )}
              {client.credit_limit && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Credit Limit</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {parseFloat(client.credit_limit).toLocaleString()} SAR
                  </p>
                </div>
              )}
              {client.payment_terms && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.payment_terms}</p>
                </div>
              )}
              {client.contract_start_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contract Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(client.contract_start_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {client.contract_end_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contract End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(client.contract_end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {(client.notes || client.contact_person || client.fax || client.linkedin) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.contact_person && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.contact_person}</p>
                  {client.contact_position && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.contact_position}</p>
                  )}
                </div>
              )}
              {client.fax && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fax</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.fax}</p>
                </div>
              )}
              {client.linkedin && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                  <a 
                    href={client.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {client.linkedin}
                  </a>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Related Lead */}
        {client.lead && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5" />
                Related Lead
              </CardTitle>
              <CardDescription>
                This client was converted from a lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{client.lead.name}</p>
                  {client.lead.company_name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.lead.company_name}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client.lead.email}</p>
                </div>
                <Button onClick={handleViewLeads} variant="outline" size="sm">
                  View All Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {client.contracts && client.contracts.length > 0 && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewContracts}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" />
                  Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.contracts.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total contracts</p>
                <Button variant="link" className="p-0 mt-2" onClick={(e) => { e.stopPropagation(); handleViewContracts(); }}>
                  View All →
                </Button>
              </CardContent>
            </Card>
          )}
          {client.quotations && client.quotations.length > 0 && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewQuotations}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" />
                  Quotations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.quotations.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total quotations</p>
                <Button variant="link" className="p-0 mt-2" onClick={(e) => { e.stopPropagation(); handleViewQuotations(); }}>
                  View All →
                </Button>
              </CardContent>
            </Card>
          )}
          {client.meetings && client.meetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.meetings.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total meetings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


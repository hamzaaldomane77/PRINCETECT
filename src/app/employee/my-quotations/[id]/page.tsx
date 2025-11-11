'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, WorkflowIcon, CalendarIcon, DollarSignIcon, FileTextIcon, HashIcon, UserIcon, PhoneIcon, MailIcon, BuildingIcon } from '@/components/ui/icons';
import { useEmployeeQuotation } from '@/modules/employee-quotations';
import { format } from 'date-fns';

interface QuotationDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  modified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const formatCurrency = (amount: string, currency: string): string => {
  return `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

export default function QuotationDetailsPage({ params }: QuotationDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const quotationId = parseInt(resolvedParams.id);

  if (isNaN(quotationId) || quotationId <= 0) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Invalid Quotation ID
            </h3>
            <Button onClick={() => router.push('/employee/my-quotations')}>
              Back to Quotations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { data: quotationResponse, isLoading, error } = useEmployeeQuotation(quotationId);
  const quotation = quotationResponse?.data;

  const handleBack = () => {
    router.push('/employee/my-quotations');
  };

  const handleViewServices = () => {
    router.push(`/employee/my-quotations/${quotationId}/services`);
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading quotation details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Quotation Not Found
            </h3>
            <Button onClick={handleBack}>
              Back to Quotations
            </Button>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {quotation.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {quotation.quotation_number} • <Badge className={statusColors[quotation.status] || statusColors.draft}>
                  {quotation.status}
                </Badge>
              </p>
            </div>
          </div>
          {quotation.quotation_services && quotation.quotation_services.length > 0 && (
            <Button onClick={handleViewServices} variant="outline" size="sm">
              <WorkflowIcon className="h-4 w-4 mr-2" />
              View Services
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Information */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quotation Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quotation.quotation_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <Badge className={statusColors[quotation.status] || statusColors.draft}>
                      {quotation.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valid Until</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {quotation.valid_until ? format(new Date(quotation.valid_until), 'MMM dd, yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Currency</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quotation.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(quotation.subtotal, quotation.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tax Rate</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quotation.tax_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tax Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(quotation.tax_amount, quotation.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Discount Rate</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quotation.discount_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Discount Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(quotation.discount_amount, quotation.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-medium text-lg text-gray-900 dark:text-white">
                      {formatCurrency(quotation.total_amount, quotation.currency)}
                    </p>
                  </div>
                  {quotation.sent_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sent Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(quotation.sent_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {quotation.accepted_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Accepted Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(quotation.accepted_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {quotation.rejected_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rejected Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(quotation.rejected_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                {quotation.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                    <p className="text-gray-900 dark:text-white">{quotation.description}</p>
                  </div>
                )}
                {quotation.terms_conditions && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Terms & Conditions</p>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{quotation.terms_conditions}</p>
                  </div>
                )}
                {quotation.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                    <p className="text-gray-900 dark:text-white">{quotation.notes}</p>
                  </div>
                )}
                {quotation.rejection_reason && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rejection Reason</p>
                    <p className="text-red-600 dark:text-red-400">{quotation.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client/Lead Information */}
            <Card>
              <CardHeader>
                <CardTitle>{quotation.client ? 'Client' : 'Lead'} Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotation.client ? (
                  <>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{quotation.client.name}</p>
                      {quotation.client.company_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quotation.client.company_name}</p>
                      )}
                    </div>
                    {quotation.client.email && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quotation.client.email}</p>
                      </div>
                    )}
                    {(quotation.client.phone || quotation.client.mobile) && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quotation.client.phone || quotation.client.mobile}
                        </p>
                      </div>
                    )}
                  </>
                ) : quotation.lead ? (
                  <>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{quotation.lead.name}</p>
                      {quotation.lead.company_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quotation.lead.company_name}</p>
                      )}
                    </div>
                    {quotation.lead.email && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quotation.lead.email}</p>
                      </div>
                    )}
                    {(quotation.lead.phone || quotation.lead.mobile) && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quotation.lead.phone || quotation.lead.mobile}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No client or lead information available</p>
                )}
              </CardContent>
            </Card>

            {/* Assigned Employee */}
            {quotation.assigned_employee && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{quotation.assigned_employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.assigned_employee.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Data */}
            <Card>
              <CardHeader>
                <CardTitle>Related Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleViewServices}
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <WorkflowIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Services</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {quotation.quotation_services?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


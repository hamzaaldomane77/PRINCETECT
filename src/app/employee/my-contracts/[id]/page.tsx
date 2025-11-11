'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, WorkflowIcon, PdaDocumentsIcon, CalendarIcon, DollarSignIcon, FileTextIcon, HashIcon, BriefcaseIcon, UserIcon, PhoneIcon, MailIcon, BuildingIcon } from '@/components/ui/icons';
import { useEmployeeContract } from '@/modules/employee-contracts';
import { format } from 'date-fns';

interface ContractDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const contractTypeColors = {
  service_subscription: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  one_time_project: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);

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

  const { data: contractResponse, isLoading, error } = useEmployeeContract(contractId);
  const contract = contractResponse?.data;

  const handleBack = () => {
    router.push('/employee/my-contracts');
  };

  const handleViewServices = () => {
    router.push(`/employee/my-contracts/${contractId}/services`);
  };

  const handleViewTasks = () => {
    router.push(`/employee/my-contracts/${contractId}/tasks`);
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading contract details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Contract Not Found
            </h3>
            <Button onClick={handleBack}>
              Back to Contracts
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
                {contract.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {contract.contract_number} • <Badge className={statusColors[contract.status as keyof typeof statusColors] || statusColors.active}>
                  {contract.status}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button onClick={handleViewServices} variant="outline" size="sm">
              <WorkflowIcon className="h-4 w-4 mr-2" />
              View Services
            </Button>
            <Button onClick={handleViewTasks} variant="outline" size="sm">
              <PdaDocumentsIcon className="h-4 w-4 mr-2" />
              View Tasks
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contract Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{contract.contract_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contract Type</p>
                    <Badge className={contractTypeColors[contract.contract_type as keyof typeof contractTypeColors] || contractTypeColors.one_time_project}>
                      {contract.contract_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contract.start_date ? format(new Date(contract.start_date), 'MMM dd, yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contract.end_date ? format(new Date(contract.end_date), 'MMM dd, yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(contract.total_amount))} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Advance Payment</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(contract.advance_payment))} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(contract.remaining_amount))} {contract.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                    <p className="font-medium text-gray-900 dark:text-white">{contract.payment_terms}</p>
                  </div>
                  {contract.signed_date && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Signed Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(contract.signed_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                {contract.description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                    <p className="text-gray-900 dark:text-white">{contract.description}</p>
                  </div>
                )}
                {contract.terms_conditions && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Terms & Conditions</p>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{contract.terms_conditions}</p>
                  </div>
                )}
                {contract.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                    <p className="text-gray-900 dark:text-white">{contract.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Quotation */}
            {contract.quotation && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Quotation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">{contract.quotation.quotation_number}</p>
                    <p className="text-gray-600 dark:text-gray-400">{contract.quotation.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(parseFloat(contract.quotation.total_amount))} {contract.quotation.currency}
                    </p>
                    <Badge>{contract.quotation.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client/Lead Information */}
            <Card>
              <CardHeader>
                <CardTitle>{contract.client ? 'Client' : 'Lead'} Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.client ? (
                  <>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.client.name}</p>
                      {contract.client.company_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contract.client.company_name}</p>
                      )}
                    </div>
                    {contract.client.email && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contract.client.email}</p>
                      </div>
                    )}
                    {(contract.client.phone || contract.client.mobile) && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.client.phone || contract.client.mobile}
                        </p>
                      </div>
                    )}
                  </>
                ) : contract.lead ? (
                  <>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.lead.name}</p>
                      {contract.lead.company_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contract.lead.company_name}</p>
                      )}
                    </div>
                    {contract.lead.email && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contract.lead.email}</p>
                      </div>
                    )}
                    {(contract.lead.phone || contract.lead.mobile) && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.lead.phone || contract.lead.mobile}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No client or lead information available</p>
                )}
              </CardContent>
            </Card>

            {/* Project Manager */}
            {contract.project_manager && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {contract.project_manager.photo ? (
                      <img
                        src={contract.project_manager.photo}
                        alt={contract.project_manager.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {contract.project_manager.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contract.project_manager.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contract.project_manager.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assigned Employee */}
            {contract.assigned_employee && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contract.assigned_employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{contract.assigned_employee.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


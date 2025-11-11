'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { ArrowLeftIcon, RefreshIcon } from '@/components/ui/icons';
import { useEmployeeQuotation, useQuotationServices } from '@/modules/employee-quotations';
import { format } from 'date-fns';

interface QuotationServicesPageProps {
  params: Promise<{
    id: string;
  }>;
}

const formatCurrency = (amount: string, currency: string): string => {
  return `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
};

export default function QuotationServicesPage({ params }: QuotationServicesPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const quotationId = parseInt(resolvedParams.id);

  const { data: quotationResponse, isLoading: isLoadingQuotation } = useEmployeeQuotation(quotationId);
  const { data: servicesResponse, isLoading: isLoadingServices, refetch } = useQuotationServices(quotationId);

  const quotation = quotationResponse?.data;
  const services = servicesResponse?.data?.services || [];

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

  if (isLoadingQuotation || isLoadingServices) {
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
      key: 'description', 
      label: 'Description', 
      type: 'text', 
      align: 'right' 
    },
  ];

  // Transform services data for the table
  const transformedServices = services.map(service => ({
    id: service.id,
    service_name: service.service_name || service.service?.name || '-',
    quantity: service.quantity,
    unit_price: formatCurrency(service.unit_price, quotation?.currency || 'SAR'),
    total_price: formatCurrency(service.total_price, quotation?.currency || 'SAR'),
    description: service.description || '-',
  }));

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => router.push(`/employee/my-quotations/${quotationId}`)} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Quotation
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotation Services</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {quotation?.title} • {quotation?.quotation_number}
              </p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <DataTable
                data={transformedServices}
                columns={columns}
                searchable={false}
                filterable={false}
                selectable={false}
                pagination={false}
                className="flex-1 flex flex-col min-h-0"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Services Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This quotation doesn't have any services assigned yet.
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
                  <CardTitle>{service.service_name || service.service?.name || 'Service'}</CardTitle>
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
                        {formatCurrency(service.unit_price, quotation?.currency || 'SAR')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                      <p className="font-medium text-lg text-gray-900 dark:text-white">
                        {formatCurrency(service.total_price, quotation?.currency || 'SAR')}
                      </p>
                    </div>
                  </div>
                  {service.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{service.description}</p>
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


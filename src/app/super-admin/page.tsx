'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ui/client-only';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsersIcon, UserCheckIcon, FileTextIcon, CalendarIcon, TrendingUpIcon, DollarSignIcon, ClockIcon, UserPlusIcon } from '@/components/ui/icons';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardOverview } from '@/modules/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import CountUp from 'react-countup';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function AdminDashboardContent() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    isError 
  } = useDashboardOverview();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Chart configurations
  const customersChartData = {
    labels: ['Total', 'Active', 'Inactive', 'Leads'],
    datasets: [
      {
        label: 'Customers',
        data: dashboardData?.data ? [
          dashboardData.data.customers.total,
          dashboardData.data.customers.active,
          dashboardData.data.customers.inactive,
          dashboardData.data.customers.leads
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const leadsChartData = {
    labels: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
    datasets: [
      {
        label: 'Leads Status',
        data: dashboardData?.data ? [
          dashboardData.data.leads.new,
          dashboardData.data.leads.contacted,
          dashboardData.data.leads.qualified,
          dashboardData.data.leads.converted,
          dashboardData.data.leads.lost
        ] : [],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const businessChartData = {
    labels: ['Contracts', 'Quotations', 'Meetings'],
    datasets: [
      {
        label: 'Total',
        data: dashboardData?.data ? [
          dashboardData.data.business.contracts_total,
          dashboardData.data.business.quotations_total,
          dashboardData.data.business.meetings_total
        ] : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Active/Pending',
        data: dashboardData?.data ? [
          dashboardData.data.business.contracts_active,
          dashboardData.data.business.quotations_pending,
          dashboardData.data.business.meetings_upcoming
        ] : [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const clientsDoughnutData = {
    labels: ['Active', 'Inactive', 'Suspended'],
    datasets: [
      {
        data: dashboardData?.data ? [
          dashboardData.data.clients.active,
          dashboardData.data.clients.inactive,
          dashboardData.data.clients.suspended
        ] : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        animation: {
          duration: 300,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        animation: {
          duration: 300,
        },
      },
    },
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6 ">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#D69235] dark:text-orange-400 mb-2">
                Good morning {user?.name || 'Admin'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to your Super Admin Dashboard
              </p>
            </div>
           
          </div>



          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="space-y-3">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading Dashboard Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error?.message || 'Failed to load dashboard statistics'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          {dashboardData?.data && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm uppercase tracking-wide">Total Customers</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                          <CountUp 
                            end={dashboardData.data.customers.total} 
                            duration={2.5}
                            separator=","
                            className="animate-pulse"
                          />
                        </p>
                        <p className="text-blue-500 dark:text-blue-400 text-sm mt-1">
                          <CountUp 
                            end={dashboardData.data.customers.active} 
                            duration={2}
                            delay={0.5}
                          /> active
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                        <UsersIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 dark:text-green-400 font-medium text-sm uppercase tracking-wide">Total Leads</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                          <CountUp 
                            end={dashboardData.data.leads.total} 
                            duration={2.5}
                            separator=","
                            className="animate-pulse"
                          />
                        </p>
                        <p className="text-green-500 dark:text-green-400 text-sm mt-1">
                          <CountUp 
                            end={dashboardData.data.leads.new} 
                            duration={2}
                            delay={0.5}
                          /> new
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                        <TrendingUpIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 dark:text-purple-400 font-medium text-sm uppercase tracking-wide">Total Clients</p>
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                          <CountUp 
                            end={dashboardData.data.clients.total} 
                            duration={2.5}
                            separator=","
                            className="animate-pulse"
                          />
                        </p>
                        <p className="text-purple-500 dark:text-purple-400 text-sm mt-1">
                          <CountUp 
                            end={dashboardData.data.clients.active} 
                            duration={2}
                            delay={0.5}
                          /> active
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                        <UserCheckIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 dark:text-orange-400 font-medium text-sm uppercase tracking-wide">Total Contracts</p>
                        <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                          <CountUp 
                            end={dashboardData.data.business.contracts_total} 
                            duration={2.5}
                            separator=","
                            className="animate-pulse"
                          />
                        </p>
                        <p className="text-orange-500 dark:text-orange-400 text-sm mt-1">
                          <CountUp 
                            end={dashboardData.data.business.contracts_active} 
                            duration={2}
                            delay={0.5}
                          /> active
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                        <FileTextIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customers Chart */}
                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <UsersIcon className="h-5 w-5 mr-2 text-blue-500 animate-pulse" />
                      Customer Overview
                    </CardTitle>
                    <CardDescription>Customer distribution and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar data={customersChartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Leads Chart */}
                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
                      Leads Status
                    </CardTitle>
                    <CardDescription>Lead progression and conversion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar data={leadsChartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Business Chart */}
                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <FileTextIcon className="h-5 w-5 mr-2 text-orange-500 animate-pulse" />
                      Business Activities
                    </CardTitle>
                    <CardDescription>Contracts, quotations, and meetings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar data={businessChartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Clients Distribution */}
                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <UserCheckIcon className="h-5 w-5 mr-2 text-purple-500 animate-pulse" />
                      Client Distribution
                    </CardTitle>
                    <CardDescription>Client status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Doughnut data={clientsDoughnutData} options={doughnutOptions} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

export default function AdminDashboard() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-orange-500"></div>
      </div>
    }>
      <AdminDashboardContent />
    </ClientOnly>
  );
} 

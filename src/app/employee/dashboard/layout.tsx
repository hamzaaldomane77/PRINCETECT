'use client';

import { EmployeeLayout } from '@/components/layout/employee-layout';

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}


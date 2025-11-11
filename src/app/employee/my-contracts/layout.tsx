'use client';

import { EmployeeLayout } from '@/components/layout/employee-layout';

export default function MyContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}


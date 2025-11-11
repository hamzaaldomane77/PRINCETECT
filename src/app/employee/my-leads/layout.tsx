'use client';

import { EmployeeLayout } from '@/components/layout/employee-layout';

export default function MyLeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}


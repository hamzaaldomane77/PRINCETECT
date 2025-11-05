'use client';

import { EmployeeLayout } from '@/components/layout/employee-layout';

export default function MyMeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}


import { EmployeeAuthProvider } from '@/contexts/employee-auth-context';

export default function EmployeeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeAuthProvider>
      {children}
    </EmployeeAuthProvider>
  );
}


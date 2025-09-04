'use client';

import { ProtectedRoute, AdminOnly, SuperAdminOnly } from '@/components/auth/protected-route';
import { Can, CanAny, CanAll, HasRole } from '@/components/auth/permission-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Shield, Users, Settings, Trash2, Edit, Plus } from 'lucide-react';

export default function ExampleProtectedPage() {
  const { user, hasRole, can } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles & Permissions Example
          </CardTitle>
          <CardDescription>
            This page demonstrates how to use the roles and permissions system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Current User Info:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </div>
                <div>
                  <p><strong>Roles:</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user?.roles.map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sample Permissions:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {user?.permissions.slice(0, 8).map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route-level protection examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Only Section */}
        <AdminOnly>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Section
              </CardTitle>
              <CardDescription>
                Only visible to admin and super_admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This content is only visible to administrators.</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminOnly>

        {/* Super Admin Only Section */}
        <SuperAdminOnly>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Super Admin Section
              </CardTitle>
              <CardDescription>
                Only visible to super_admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This content is only visible to super administrators.</p>
              <div className="mt-4 space-y-2">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  System Reset
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </SuperAdminOnly>
      </div>

      {/* Component-level protection examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component-Level Permission Examples</CardTitle>
          <CardDescription>
            These buttons are conditionally rendered based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* View Employees Permission */}
            <Can permission="view_employees">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                View Employees
              </Button>
            </Can>

            {/* Edit Employees Permission */}
            <Can permission="edit_employees">
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Employees
              </Button>
            </Can>

            {/* Delete Employees Permission */}
            <Can permission="delete_employees">
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Employees
              </Button>
            </Can>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Advanced Permission Examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Multiple permissions - any */}
              <CanAny permissions={['view_customers', 'view_leads']}>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-green-800">
                      This card is visible if you have either &apos;view_customers&apos; OR &apos;view_leads&apos; permission
                    </p>
                  </CardContent>
                </Card>
              </CanAny>

              {/* Multiple permissions - all required */}
              <CanAll permissions={['view_employees', 'edit_employees']}>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-blue-800">
                      This card is visible if you have BOTH &apos;view_employees&apos; AND &apos;edit_employees&apos; permissions
                    </p>
                  </CardContent>
                </Card>
              </CanAll>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission testing section */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Testing</CardTitle>
          <CardDescription>
            Test your current permissions and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium">Super Admin</p>
                <Badge variant={hasRole('super_admin') ? 'default' : 'secondary'}>
                  {hasRole('super_admin') ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Admin</p>
                <Badge variant={hasRole('admin') ? 'default' : 'secondary'}>
                  {hasRole('admin') ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">View Employees</p>
                <Badge variant={can('view_employees') ? 'default' : 'secondary'}>
                  {can('view_employees') ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Edit Employees</p>
                <Badge variant={can('edit_employees') ? 'default' : 'secondary'}>
                  {can('edit_employees') ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { useEmployee, useUpdateEmployee, useManagersLookup } from '@/modules/employees';
import { UpdateEmployeeRequest, UpdateEmployeeApiRequest } from '@/modules/employees/types';
import { useDepartments } from '@/modules/departments';
import { useJobTitles } from '@/modules/job-titles';
import { useEmployeeTypes } from '@/modules/employee-types';
import { useCities } from '@/modules/cities';
import { getEmployeePhotoUrl } from '@/lib/image-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const employeeId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    birth_date: '',
    gender: 'male',
    city_id: undefined as number | undefined,
    address: '',
    marital_status: 'single',
    military_status: '',
    
    // Employment Information
    employee_id: '',
    job_title_id: 0,
    department_id: 0,
    department_manager_id: undefined as number | undefined,
    hire_date: '',
    team_name: '',
    employee_type_id: undefined as number | undefined,
    job_description: '',
    
    // Contact Information
    work_mobile: '',
    office_phone: '',
    work_email: '',
    personal_mobile: '',
    home_phone: '',
    personal_email: '',
    business_number: '',
    office_number: '',
    phone_number: '',
    home_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    
    // Authentication & Status
    password: '',
    status: 'active',
    notes: '',
    photo: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Fetch employee data and lookup data
  const { data: employee, isLoading, error } = useEmployee(employeeId);
  const updateEmployeeMutation = useUpdateEmployee();
  
  // Fetch lookup data
  const { data: departmentsResponse } = useDepartments();
  const { data: jobTitlesResponse } = useJobTitles();
  const { data: employeeTypesResponse } = useEmployeeTypes();
  const { data: citiesResponse } = useCities();
  const { data: managers = [], isLoading: managersLoading } = useManagersLookup();
  
  const departments = departmentsResponse?.data.departments || [];
  const jobTitles = jobTitlesResponse?.data.job_titles || [];
  const employeeTypes = employeeTypesResponse?.data.employee_types || [];
  const cities = citiesResponse?.data.cities || [];

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employees', href: '/super-admin/employee-management/employees' },
    { label: employee?.name || 'Edit Employee' },
    { label: 'Edit' }
  ];

  // Update form data when employee is loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        // Personal Information
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        father_name: employee.father_name || '',
        mother_name: employee.mother_name || '',
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
        gender: (employee.gender as 'male' | 'female') || 'male',
        city_id: employee.city_id || undefined,
        address: employee.address || '',
        marital_status: (employee.marital_status as 'single' | 'married' | 'divorced' | 'widowed') || 'single',
        military_status: employee.military_status || '',
        
        // Employment Information
        employee_id: employee.employee_id || '',
        job_title_id: employee.job_title_id || 0,
        department_id: employee.department_id || 0,
        department_manager_id: employee.department_manager_id || undefined,
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        team_name: employee.team_name || '',
        employee_type_id: employee.employee_type_id || undefined,
        job_description: employee.job_description || '',
        
        // Contact Information
        work_mobile: employee.work_mobile || '',
        office_phone: employee.office_phone || '',
        work_email: employee.work_email || '',
        personal_mobile: employee.personal_mobile || '',
        home_phone: employee.home_phone || '',
        personal_email: employee.personal_email || '',
        business_number: employee.business_number || '',
        office_number: employee.office_number || '',
        phone_number: employee.phone_number || '',
        home_number: employee.home_number || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_number: employee.emergency_contact_number || '',
        emergency_contact_relationship: employee.emergency_contact_relationship || '',
        
        // Authentication & Status
        password: '', // Don't populate password for security
        status: (employee.status as 'active' | 'inactive') || 'active',
        notes: employee.notes || '',
        photo: null, // Photo will be handled separately
      });

      // Set image preview if employee has a photo
      if (employee.photo) {
        const imageUrl = getEmployeePhotoUrl(employee.photo);
        setImagePreview(imageUrl);
      }
    }
  }, [employee]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (file: File | null) => {
    handleInputChange('photo', file);
    
    // Create image preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If clearing file, show original employee photo if exists
      if (employee?.photo) {
        const imageUrl = getEmployeePhotoUrl(employee.photo);
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform data to match API requirements
      const { photo, ...apiFormData } = formData;
      const apiData: UpdateEmployeeApiRequest = {
        ...apiFormData,
      };

      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        data: apiData
      });
      
      toast.success('Employee updated successfully!');
      router.push('/super-admin/employee-management/employees');
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      
      // Handle validation errors from backend
      if (error?.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error('Please fix the validation errors in the form');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
      toast.error('Failed to update employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render validation errors
  const renderFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      return (
        <div className="mt-1">
          {validationErrors[fieldName].map((error, index) => (
            <p key={index} className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading employee data...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !employee) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Employee Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    The employee you're trying to edit could not be found.
                  </p>
                  <Button
                    onClick={() => router.push('/super-admin/employee-management/employees')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Back to Employees
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex-none p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Employee
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update employee information below
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
                  
                  <Button
                    form="edit-employee-form"
                    type="submit"
                    disabled={updateEmployeeMutation.isPending || loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    <span>{updateEmployeeMutation.isPending || loading ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                
                <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          First Name *
                        </Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          required
                          className={validationErrors.first_name ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('first_name')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name *
                        </Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          required
                          className={validationErrors.last_name ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('last_name')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="father_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Father Name
                        </Label>
                        <Input
                          id="father_name"
                          value={formData.father_name}
                          onChange={(e) => handleInputChange('father_name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mother_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mother Name
                        </Label>
                        <Input
                          id="mother_name"
                          value={formData.mother_name}
                          onChange={(e) => handleInputChange('mother_name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Birth Date
                        </Label>
                        <Input
                          id="birth_date"
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => handleInputChange('birth_date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Gender *
                        </Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="marital_status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Marital Status *
                        </Label>
                        <Select value={formData.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="military_status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Military Status
                        </Label>
                        <Input
                          id="military_status"
                          value={formData.military_status}
                          onChange={(e) => handleInputChange('military_status', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </Label>
                        <Select value={formData.city_id?.toString() || ''} onValueChange={(value) => handleInputChange('city_id', value ? parseInt(value) : undefined)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={validationErrors.address ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('address')}
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="employee_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee ID *
                        </Label>
                        <Input
                          id="employee_id"
                          value={formData.employee_id}
                          onChange={(e) => handleInputChange('employee_id', e.target.value)}
                          placeholder="مثال: EMP-1001"
                          required
                          className={validationErrors.employee_id ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('employee_id')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hire_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hire Date *
                        </Label>
                        <Input
                          id="hire_date"
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => handleInputChange('hire_date', e.target.value)}
                          required
                          className={validationErrors.hire_date ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('hire_date')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="job_title_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Title *
                        </Label>
                        <Select value={formData.job_title_id.toString()} onValueChange={(value) => handleInputChange('job_title_id', parseInt(value))}>
                          <SelectTrigger className={validationErrors.job_title_id ? 'border-red-500 focus:border-red-500' : ''}>
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTitles.map((jobTitle) => (
                              <SelectItem key={jobTitle.id} value={jobTitle.id.toString()}>
                                {jobTitle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldError('job_title_id')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Department *
                        </Label>
                        <Select value={formData.department_id.toString()} onValueChange={(value) => handleInputChange('department_id', parseInt(value))}>
                          <SelectTrigger className={validationErrors.department_id ? 'border-red-500 focus:border-red-500' : ''}>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldError('department_id')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employee_type_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee Type
                        </Label>
                        <Select value={formData.employee_type_id?.toString() || ''} onValueChange={(value) => handleInputChange('employee_type_id', value ? parseInt(value) : undefined)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee type" />
                          </SelectTrigger>
                          <SelectContent>
                            {employeeTypes.map((employeeType) => (
                              <SelectItem key={employeeType.id} value={employeeType.id.toString()}>
                                {employeeType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department_manager_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Department Manager
                        </Label>
                        <Select 
                          value={formData.department_manager_id?.toString() || ''} 
                          onValueChange={(value) => handleInputChange('department_manager_id', value ? parseInt(value) : undefined)}
                          disabled={managersLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={managersLoading ? "Loading managers..." : "Select department manager"} />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.value} value={manager.value.toString()}>
                                {manager.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="team_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Team Name
                        </Label>
                        <Input
                          id="team_name"
                          value={formData.team_name}
                          onChange={(e) => handleInputChange('team_name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="work_email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Work Email *
                        </Label>
                        <Input
                          id="work_email"
                          type="email"
                          value={formData.work_email}
                          onChange={(e) => handleInputChange('work_email', e.target.value)}
                          required
                          className={validationErrors.work_email ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('work_email')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="work_mobile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Work Mobile
                        </Label>
                        <Input
                          id="work_mobile"
                          value={formData.work_mobile}
                          onChange={(e) => handleInputChange('work_mobile', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="office_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Office Phone
                        </Label>
                        <Input
                          id="office_phone"
                          value={formData.office_phone}
                          onChange={(e) => handleInputChange('office_phone', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Leave empty to keep current password"
                            className={`pr-10 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {renderFieldError('password')}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Leave empty to keep current password
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="job_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Description
                        </Label>
                        <Textarea
                          id="job_description"
                          value={formData.job_description}
                          onChange={(e) => handleInputChange('job_description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="personal_mobile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Personal Mobile
                        </Label>
                        <Input
                          id="personal_mobile"
                          value={formData.personal_mobile}
                          onChange={(e) => handleInputChange('personal_mobile', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Home Phone
                        </Label>
                        <Input
                          id="home_phone"
                          value={formData.home_phone}
                          onChange={(e) => handleInputChange('home_phone', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="personal_email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Personal Email
                        </Label>
                        <Input
                          id="personal_email"
                          type="email"
                          value={formData.personal_email}
                          onChange={(e) => handleInputChange('personal_email', e.target.value)}
                          className={validationErrors.personal_email ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('personal_email')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact Name
                        </Label>
                        <Input
                          id="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact Number
                        </Label>
                        <Input
                          id="emergency_contact_number"
                          value={formData.emergency_contact_number}
                          onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact Relationship
                        </Label>
                        <Input
                          id="emergency_contact_relationship"
                          value={formData.emergency_contact_relationship}
                          onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Number
                        </Label>
                        <Input
                          id="business_number"
                          value={formData.business_number}
                          onChange={(e) => handleInputChange('business_number', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="office_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Office Number
                        </Label>
                        <Input
                          id="office_number"
                          value={formData.office_number}
                          onChange={(e) => handleInputChange('office_number', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Home Number
                        </Label>
                        <Input
                          id="home_number"
                          value={formData.home_number}
                          onChange={(e) => handleInputChange('home_number', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="photo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee Photo
                        </Label>
                        
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="flex justify-center">
                            <div className="relative">
                              <img 
                                src={imagePreview} 
                                alt="Photo preview" 
                                className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => handlePhotoChange(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* File Input */}
                        <div className="flex items-center justify-center w-full">
                          <label 
                            htmlFor="photo" 
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                              validationErrors.photo 
                                ? 'border-red-500 dark:border-red-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG or GIF (max 2MB)
                              </p>
                            </div>
                            <Input
                              id="photo"
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handlePhotoChange(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        
                        {renderFieldError('photo')}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { ArrowLeftIcon, PlusIcon, CalendarIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { useCreateEmployee, useManagersLookup } from '@/modules/employees';
import { CreateEmployeeRequest } from '@/modules/employees/types';
import { useDepartments } from '@/modules/departments';
import { useJobTitles } from '@/modules/job-titles';
import { useEmployeeTypes } from '@/modules/employee-types';
import { useCities } from '@/modules/cities';
import { getEmployeePhotoUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

export default function CreateEmployeePage() {
  const router = useRouter();
  const createEmployeeMutation = useCreateEmployee();
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [hireDateOpen, setHireDateOpen] = useState(false);
  const [birthDateCaptionLayout, setBirthDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years">("dropdown");
  const [hireDateCaptionLayout, setHireDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years">("dropdown");
  const [showYearPicker, setShowYearPicker] = useState<'birth' | 'hire' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  // Set default values when data is loaded
  useEffect(() => {
    if (cities.length > 0 && !formData.city_id) {
      handleInputChange('city_id', cities[0].id);
    }
  }, [cities]);

  useEffect(() => {
    if (jobTitles.length > 0 && formData.job_title_id === 0) {
      handleInputChange('job_title_id', jobTitles[0].id);
    }
  }, [jobTitles]);

  useEffect(() => {
    if (departments.length > 0 && formData.department_id === 0) {
      handleInputChange('department_id', departments[0].id);
    }
  }, [departments]);

  useEffect(() => {
    if (employeeTypes.length > 0 && formData.employee_type_id === 0) {
      handleInputChange('employee_type_id', employeeTypes[0].id);
    }
  }, [employeeTypes]);

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employees', href: '/super-admin/employee-management/employees' },
    { label: 'Create New Employee' }
  ];

  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    birth_date: '',
    gender: 'male',
    city_id: undefined,
    address: '',
    marital_status: 'single',
    military_status: '',
    employee_id: '',
    job_title_id: 0,
    department_id: 0,
    department_manager_id: undefined,
    hire_date: '',
    team_name: '',
    employee_type_id: 0,
    job_description: '',
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
    password: '',
    status: 'active',
    notes: '',
    photo: null,
  });

  const handleInputChange = (field: keyof CreateEmployeeRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      setImagePreview(null);
    }
  };

  // Helper function to format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to handle date selection
  const handleDateSelect = (field: 'birth_date' | 'hire_date', date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date); // Use local date without timezone conversion
      handleInputChange(field, formattedDate);
    }
    if (field === 'birth_date') setBirthDateOpen(false);
    if (field === 'hire_date') setHireDateOpen(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    // Personal Information Validation
    if (!formData.first_name.trim()) {
      errors.first_name = ['الاسم الأول فارغ'];
    }
    if (!formData.last_name.trim()) {
      errors.last_name = ['الاسم الأخير فارغ'];
    }
    if (formData.address && formData.address.length > 500) {
      errors.address = [`العنوان طويل جداً (${formData.address.length}/500 حرف)`];
    }
    if (formData.marital_status && !['single', 'married', 'divorced', 'widowed'].includes(formData.marital_status)) {
      errors.marital_status = ['الحالة الاجتماعية غير صحيحة'];
    }

    // Employment Information Validation
    if (!formData.employee_id.trim()) {
      errors.employee_id = ['معرف الموظف فارغ'];
    } else if (formData.employee_id.length > 50) {
      errors.employee_id = [`معرف الموظف طويل جداً (${formData.employee_id.length}/50 حرف)`];
    }
    if (!formData.job_title_id || formData.job_title_id === 0) {
      errors.job_title_id = ['لم يتم اختيار المسمى الوظيفي'];
    }
    if (!formData.department_id || formData.department_id === 0) {
      errors.department_id = ['لم يتم اختيار القسم'];
    }
    if (!formData.hire_date) {
      errors.hire_date = ['تاريخ التعيين فارغ'];
    }
    if (formData.team_name && formData.team_name.length > 255) {
      errors.team_name = [`اسم الفريق طويل جداً (${formData.team_name.length}/255 حرف)`];
    }

    // Contact Information Validation
    if (!formData.work_email.trim()) {
      errors.work_email = ['البريد الإلكتروني للعمل فارغ'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.work_email)) {
      errors.work_email = ['تنسيق البريد الإلكتروني للعمل غير صحيح'];
    } else if (formData.work_email.length > 255) {
      errors.work_email = [`البريد الإلكتروني للعمل طويل جداً (${formData.work_email.length}/255 حرف)`];
    }

    if (!formData.work_mobile.trim()) {
      errors.work_mobile = ['هاتف العمل المحمول فارغ'];
    }

    if (formData.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal_email)) {
      errors.personal_email = ['تنسيق البريد الإلكتروني الشخصي غير صحيح'];
    }
    if (formData.personal_email && formData.personal_email.length > 255) {
      errors.personal_email = [`البريد الإلكتروني الشخصي طويل جداً (${formData.personal_email.length}/255 حرف)`];
    }

    // Phone number validation (max 20 characters) with Arabic field names
    const phoneFieldsArabic: Record<string, string> = {
      'work_mobile': 'هاتف العمل المحمول',
      'office_phone': 'هاتف المكتب',
      'personal_mobile': 'الهاتف الشخصي المحمول',
      'home_phone': 'هاتف المنزل',
      'business_number': 'رقم العمل',
      'office_number': 'رقم المكتب',
      'phone_number': 'رقم الهاتف',
      'home_number': 'رقم المنزل',
      'emergency_contact_number': 'رقم الاتصال الطارئ'
    };
    
    Object.keys(phoneFieldsArabic).forEach(field => {
      const value = formData[field as keyof CreateEmployeeRequest] as string;
      if (value && value.length > 20) {
        errors[field] = [`${phoneFieldsArabic[field]} طويل جداً (${value.length}/20 حرف)`];
      }
    });

    // Emergency contact validation
    if (formData.emergency_contact_name && formData.emergency_contact_name.length > 255) {
      errors.emergency_contact_name = [`اسم جهة الاتصال الطارئ طويل جداً (${formData.emergency_contact_name.length}/255 حرف)`];
    }
    if (formData.emergency_contact_relationship && formData.emergency_contact_relationship.length > 255) {
      errors.emergency_contact_relationship = [`صلة القرابة طويلة جداً (${formData.emergency_contact_relationship.length}/255 حرف)`];
    }

    // Authentication Validation
    if (!formData.password.trim()) {
      errors.password = ['كلمة المرور فارغة'];
    } else if (formData.password.length < 8) {
      errors.password = [`كلمة المرور قصيرة جداً (${formData.password.length}/8 أحرف على الأقل)`];
    }

    if (formData.status && !['active', 'inactive'].includes(formData.status)) {
      errors.status = ['حالة الموظف غير صحيحة'];
    }

    // Photo validation
    if (formData.photo) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(formData.photo.type)) {
        errors.photo = [`Unsupported file type (${formData.photo.type}) - Accepted: JPEG, PNG, JPG, GIF`];
      }
      if (formData.photo.size > 2048 * 1024) { // 2MB in bytes
        const fileSizeMB = (formData.photo.size / (1024 * 1024)).toFixed(1);
        errors.photo = [`Image size too large (${fileSizeMB}MB/2MB max)`];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    
    // Validate form data
    if (!validateForm()) {
      toast.error('There are errors in the form, please fix them before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createEmployeeMutation.mutateAsync(formData);
      
      toast.success('Employee created successfully!');
      router.push('/super-admin/employee-management/employees');
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      console.log('Error structure:', JSON.stringify(error, null, 2));
      
      // Check different possible error structures based on how apiClient and react-query might wrap errors
      let responseData = null;
      let statusCode = null;
      
      // Try different ways the error might be structured
      if (error?.response?.data) {
        responseData = error.response.data;
        statusCode = error.response.status;
      } else if (error?.data) {
        responseData = error.data;
        statusCode = error.status;
      } else if (error?.cause?.response?.data) {
        responseData = error.cause.response.data;
        statusCode = error.cause.response.status;
      } else if (error?.response) {
        // Try to parse response if it's text
        try {
          responseData = typeof error.response === 'string' ? JSON.parse(error.response) : error.response;
          statusCode = error.status;
        } catch (e) {
          console.log('Could not parse response:', error.response);
        }
      }
      
      console.log('Extracted responseData:', responseData);
      console.log('Extracted statusCode:', statusCode);
      
      // Handle validation errors from backend
      if (responseData && responseData.errors) {
        // Convert backend errors to format expected by form
        const englishErrors: Record<string, string[]> = {};
        Object.entries(responseData.errors).forEach(([field, messages]) => {
          englishErrors[field] = messages as string[];
        });
        setValidationErrors(englishErrors);
        
        // Show user-friendly message based on errors
        const errorFields = Object.keys(responseData.errors);
        if (errorFields.includes('employee_id') && errorFields.includes('work_email')) {
          toast.error('Employee ID and email address are already in use. Please choose different ones.');
        } else if (errorFields.includes('employee_id')) {
          toast.error('This Employee ID is already taken. Please choose a different Employee ID.');
        } else if (errorFields.includes('work_email')) {
          toast.error('This email address is already in use. Please use a different email address.');
        } else if (responseData.message) {
          // Translate common backend messages to user-friendly ones
          const message = responseData.message.toLowerCase();
          if (message.includes('validation')) {
            toast.error('Please check the highlighted fields and correct the errors.');
          } else if (message.includes('already taken') || message.includes('duplicate')) {
            toast.error('Some information you entered is already in use. Please check the highlighted fields.');
          } else {
            toast.error('Please correct the errors in the form before submitting.');
          }
        } else {
          toast.error('Please correct the errors in the form before submitting.');
        }
        return;
      }
      
      // Handle single error message from backend
      if (responseData && responseData.message) {
        // Translate technical messages to user-friendly ones
        const message = responseData.message.toLowerCase();
        if (message.includes('unauthorized') || message.includes('unauthenticated')) {
          toast.error('Your session has expired. Please log in again.');
        } else if (message.includes('forbidden') || message.includes('permission')) {
          toast.error('You do not have permission to perform this action.');
        } else if (message.includes('not found')) {
          toast.error('The requested information could not be found.');
        } else if (message.includes('server error') || message.includes('internal error')) {
          toast.error('A server error occurred. Please try again later.');
        } else if (message.includes('network') || message.includes('connection')) {
          toast.error('Connection problem. Please check your internet and try again.');
        } else {
          // For other messages, show them as-is if they seem user-friendly
          toast.error(responseData.message);
        }
        return;
      }
      
      // Handle specific HTTP status codes with user-friendly messages
      if (statusCode) {
        switch (statusCode) {
          case 422:
            if (responseData?.errors) {
              toast.error('Some fields contain invalid information. Please check the highlighted fields and try again.');
            } else {
              toast.error('The information you submitted is invalid. Please review all fields and try again.');
            }
            break;
          case 409:
            toast.error('This employee information conflicts with existing records. Please check Employee ID and email address.');
            break;
          case 401:
            toast.error('Your session has expired. Please log in again to continue.');
            break;
          case 403:
            toast.error('You do not have permission to create employees. Please contact your administrator.');
            break;
          case 500:
            toast.error('The server encountered an error. Please try again in a few moments.');
            break;
          case 503:
            toast.error('The service is temporarily unavailable. Please try again later.');
            break;
          case 400:
            toast.error('The request contains invalid information. Please check all fields and try again.');
            break;
          case 429:
            toast.error('Too many requests. Please wait a moment before trying again.');
            break;
          default:
            if (statusCode >= 500) {
              toast.error('A server error occurred. Please try again later or contact support if the problem persists.');
            } else if (statusCode >= 400) {
              toast.error('There was a problem with your request. Please check your information and try again.');
            } else {
              toast.error('An unexpected error occurred. Please try again.');
            }
        }
        return;
      }
      
      // Handle network errors (only if no response was found)
      if (error?.code === 'NETWORK_ERROR' || (!responseData && !statusCode && error?.message?.includes('fetch'))) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
        return;
      }
      
      // Handle timeout errors
      if (error?.message?.includes('timeout')) {
        toast.error('The request took too long to complete. Please try again.');
        return;
      }
      
      // Fallback error message with user-friendly approach
      if (error?.message) {
        const message = error.message.toLowerCase();
        if (message.includes('fetch') || message.includes('network')) {
          toast.error('Connection problem. Please check your internet and try again.');
        } else if (message.includes('parse') || message.includes('json')) {
          toast.error('Received invalid response from server. Please try again.');
        } else if (message.includes('cors')) {
          toast.error('Access blocked by security policy. Please contact support.');
        } else {
          // Show original message if it seems user-friendly (no technical jargon)
          if (message.length < 100 && !message.includes('stack') && !message.includes('undefined')) {
            toast.error(error.message);
          } else {
            toast.error('An unexpected error occurred while creating the employee. Please try again.');
          }
        }
      } else {
        toast.error('An unexpected error occurred. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to translate field error messages to user-friendly format
  const translateFieldError = (fieldName: string, error: string): string => {
    // Common field name translations
    const fieldLabels: Record<string, string> = {
      'employee_id': 'Employee ID',
      'work_email': 'Work Email',
      'personal_email': 'Personal Email',
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'job_title_id': 'Job Title',
      'department_id': 'Department',
      'hire_date': 'Hire Date',
      'work_mobile': 'Work Mobile',
      'photo': 'Profile Photo'
    };

    const fieldLabel = fieldLabels[fieldName] || fieldName.replace('_', ' ');
    
    // Common error message translations
    if (error.includes('already been taken')) {
      return `${fieldLabel} is already in use`;
    } else if (error.includes('required')) {
      return `${fieldLabel} is required`;
    } else if (error.includes('invalid')) {
      return `${fieldLabel} format is invalid`;
    } else if (error.includes('too long') || error.includes('exceed')) {
      return `${fieldLabel} is too long`;
    } else if (error.includes('too short') || error.includes('minimum')) {
      return `${fieldLabel} is too short`;
    } else if (error.includes('format')) {
      return `${fieldLabel} format is incorrect`;
    } else {
      // Return original error if it's already user-friendly
      return error;
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
                    Employee Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter the details of the new employee below
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
                    form="create-employee-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>{isSubmitting ? 'Creating...' : 'Create Employee'}</span>
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
                
                <form id="create-employee-form" onSubmit={handleSubmit} className="space-y-8">
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
                        <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.birth_date && 'text-muted-foreground'
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.birth_date ? formatDate(formData.birth_date) : 'Select birth date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3">
                              <Calendar
                                mode="single"
                                selected={formData.birth_date ? new Date(formData.birth_date) : undefined}
                                onSelect={(date) => handleDateSelect('birth_date', date)}
                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                captionLayout={birthDateCaptionLayout}
                                
                                initialFocus
                              />
                              <div className="mt-3 flex flex-col gap-3">
                                <Label htmlFor="birth-date-dropdown" className="px-1 text-sm">
                                  Date Selection Mode
                                </Label>
                                <Select
                                  value={birthDateCaptionLayout}
                                  onValueChange={(value) =>
                                    setBirthDateCaptionLayout(
                                      value as "dropdown" | "dropdown-months" | "dropdown-years"
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    id="birth-date-dropdown"
                                    size="sm"
                                    className="bg-background w-full"
                                  >
                                    <SelectValue placeholder="Select mode" />
                                  </SelectTrigger>
                                  <SelectContent align="center">
                                    <SelectItem value="dropdown">Month and Year</SelectItem>
                                    <SelectItem value="dropdown-months">Month Only</SelectItem>
                                    <SelectItem value="dropdown-years">Year Only</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                        <Popover open={hireDateOpen} onOpenChange={setHireDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.hire_date && 'text-muted-foreground'
                              } ${validationErrors.hire_date ? 'border-red-500 focus:border-red-500' : ''}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.hire_date ? formatDate(formData.hire_date) : 'Select hire date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3">
                              <Calendar
                                mode="single"
                                selected={formData.hire_date ? new Date(formData.hire_date) : undefined}
                                onSelect={(date) => handleDateSelect('hire_date', date)}
                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                captionLayout={hireDateCaptionLayout}
                                
                                initialFocus
                              />
                              <div className="mt-3 flex flex-col gap-3">
                                <Label htmlFor="hire-date-dropdown" className="px-1 text-sm">
                                  Date Selection Mode
                                </Label>
                                <Select
                                  value={hireDateCaptionLayout}
                                  onValueChange={(value) =>
                                    setHireDateCaptionLayout(
                                      value as "dropdown" | "dropdown-months" | "dropdown-years"
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    id="hire-date-dropdown"
                                    size="sm"
                                    className="bg-background w-full"
                                  >
                                    <SelectValue placeholder="Select mode" />
                                  </SelectTrigger>
                                  <SelectContent align="center">
                                    <SelectItem value="dropdown">Month and Year</SelectItem>
                                    <SelectItem value="dropdown-months">Month Only</SelectItem>
                                    <SelectItem value="dropdown-years">Year Only</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                          Employee Type *
                        </Label>
                        <Select value={formData.employee_type_id.toString()} onValueChange={(value) => handleInputChange('employee_type_id', parseInt(value))}>
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
                          className={validationErrors.team_name ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('team_name')}
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
                          Work Mobile *
                        </Label>
                        <Input
                          id="work_mobile"
                          value={formData.work_mobile}
                          onChange={(e) => handleInputChange('work_mobile', e.target.value)}
                          required
                          className={validationErrors.work_mobile ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('work_mobile')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="office_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Office Phone
                        </Label>
                        <Input
                          id="office_phone"
                          value={formData.office_phone}
                          onChange={(e) => handleInputChange('office_phone', e.target.value)}
                          className={validationErrors.office_phone ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('office_phone')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
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
                          className={validationErrors.personal_mobile ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('personal_mobile')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Home Phone
                        </Label>
                        <Input
                          id="home_phone"
                          value={formData.home_phone}
                          onChange={(e) => handleInputChange('home_phone', e.target.value)}
                          className={validationErrors.home_phone ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('home_phone')}
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
                          className={validationErrors.emergency_contact_name ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('emergency_contact_name')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact Number
                        </Label>
                        <Input
                          id="emergency_contact_number"
                          value={formData.emergency_contact_number}
                          onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                          className={validationErrors.emergency_contact_number ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('emergency_contact_number')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact Relationship
                        </Label>
                        <Input
                          id="emergency_contact_relationship"
                          value={formData.emergency_contact_relationship}
                          onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                          className={validationErrors.emergency_contact_relationship ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('emergency_contact_relationship')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Number
                        </Label>
                        <Input
                          id="business_number"
                          value={formData.business_number}
                          onChange={(e) => handleInputChange('business_number', e.target.value)}
                          className={validationErrors.business_number ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('business_number')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="office_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Office Number
                        </Label>
                        <Input
                          id="office_number"
                          value={formData.office_number}
                          onChange={(e) => handleInputChange('office_number', e.target.value)}
                          className={validationErrors.office_number ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('office_number')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          className={validationErrors.phone_number ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('phone_number')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Home Number
                        </Label>
                        <Input
                          id="home_number"
                          value={formData.home_number}
                          onChange={(e) => handleInputChange('home_number', e.target.value)}
                          className={validationErrors.home_number ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {renderFieldError('home_number')}
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

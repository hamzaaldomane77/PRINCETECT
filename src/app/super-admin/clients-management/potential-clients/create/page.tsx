'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeftIcon, PlusIcon, UploadIcon, CalendarIcon } from '@/components/ui/icons';
import { useCreateLead } from '@/modules/leads';
import { CreateLeadRequest } from '@/modules/leads/types';
import { useCities } from '@/modules/cities';
import { useClients } from '@/modules/clients';
import { useEmployees } from '@/modules/employees';
import { toast } from 'sonner';

export default function CreatePotentialClientPage() {
  const router = useRouter();
  const createLeadMutation = useCreateLead();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch lookup data
  const { data: citiesResponse } = useCities();
  const { data: clientsResponse } = useClients();
  const { data: employeesResponse } = useEmployees();
  
  const cities = citiesResponse?.data?.cities || [];
  const clients = clientsResponse?.data?.clients || [];
  const employees = employeesResponse?.data?.employees || [];

  const [formData, setFormData] = useState<CreateLeadRequest>({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    company_name: '',
    position: '',
    address: '',
    website: '',
    linkedin: '',
    logo: '',
    registration_number: '',
    city_id: null,
    contact_person: '',
    contact_position: '',
    fax: '',
    industry: null,
    size: null,
    annual_revenue: '',
    is_active: true,
    status: 'contacted',
    priority: 'medium',
    source: null,
    assigned_to: null,
    budget: '',
    notes: '',
    expected_closing_date: '',
    expected_value: '',
    alternative_contact: '',
    client_id: null,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [expectedClosingDateOpen, setExpectedClosingDateOpen] = useState(false);
  const [expectedClosingDateCaptionLayout, setExpectedClosingDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years">("dropdown");

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Potential Clients', href: '/super-admin/clients-management/potential-clients' },
    { label: 'Create New Lead' }
  ];

  const handleInputChange = (field: keyof CreateLeadRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // Helper function to handle date selection
  const handleDateSelect = (field: 'expected_closing_date', date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange(field, formattedDate);
    }
    setExpectedClosingDateOpen(false);
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validateWebsite = (website: string): string | null => {
    if (!website.trim()) return null; // Optional field
    
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Website must be a valid URL (e.g., https://example.com)';
      }
    } catch {
      return 'Please enter a valid website URL (e.g., https://example.com)';
    }
    return null;
  };

  const validateLinkedIn = (linkedin: string): string | null => {
    if (!linkedin.trim()) return null; // Optional field
    
    try {
      const url = new URL(linkedin.startsWith('http') ? linkedin : `https://${linkedin}`);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Please enter a valid URL (e.g., https://linkedin.com/in/username)';
      }
    } catch {
      return 'Please enter a valid URL (e.g., https://linkedin.com/in/username)';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = ['Lead name is required'];
    }

    if (!formData.email.trim()) {
      newErrors.email = ['Email is required'];
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = [emailError];
      }
    }

    // Optional field validations
    if (formData.website) {
      const websiteError = validateWebsite(formData.website);
      if (websiteError) {
        newErrors.website = [websiteError];
      }
    }

    if (formData.linkedin) {
      const linkedinError = validateLinkedIn(formData.linkedin);
      if (linkedinError) {
        newErrors.linkedin = [linkedinError];
      }
    }

    // Budget and expected value validation
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = ['Budget must be a valid number'];
    }

    if (formData.expected_value && isNaN(parseFloat(formData.expected_value))) {
      newErrors.expected_value = ['Expected value must be a valid number'];
    }

    if (formData.annual_revenue && isNaN(parseFloat(formData.annual_revenue))) {
      newErrors.annual_revenue = ['Annual revenue must be a valid number'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        element.focus();
      }
    }
  };

  // Helper function to render error messages for a field
  const renderFieldErrors = (fieldName: string) => {
    const fieldErrors = errors[fieldName];
    if (!fieldErrors || fieldErrors.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {fieldErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="block w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
            {error}
          </p>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Validate form
    if (!validateForm()) {
      setIsValidating(false);
      toast.error('Please fix the errors below');
      // Scroll to first error after a short delay to ensure errors are rendered
      setTimeout(scrollToError, 100);
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof CreateLeadRequest];
        if (value !== null && value !== undefined) {
          if (key === 'is_active') {
            formDataToSend.append(key, value ? '1' : '0');
          } else {
            // Always send priority and status values even if they're default
            if (key === 'priority' || key === 'status') {
              formDataToSend.append(key, value.toString());
            } else if (value !== '') {
              formDataToSend.append(key, value.toString());
            }
          }
        }
      });

      // Add logo file if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      await createLeadMutation.mutateAsync(formDataToSend as any);
      toast.success('Lead created successfully!');
      router.push('/super-admin/clients-management/potential-clients');
    } catch (error) {
      console.error('Failed to create lead:', error);
      
      // Handle API validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data?.errors) {
          // Server-side validation errors - translate and display
          const serverErrors: Record<string, string[]> = {};
          Object.keys(apiError.response.data.errors).forEach(field => {
            const fieldErrors = apiError.response.data.errors[field];
            const translatedErrors = Array.isArray(fieldErrors) 
              ? fieldErrors.map(translateError) 
              : [translateError(fieldErrors)];
            serverErrors[field] = translatedErrors;
          });
          setErrors(serverErrors);
          setTimeout(scrollToError, 100);
          
          // Show detailed error message
          const errorCount = Object.keys(serverErrors).length;
          const totalErrors = Object.values(serverErrors).reduce((acc, errors) => acc + errors.length, 0);
          toast.error(`Found ${totalErrors} validation error${totalErrors > 1 ? 's' : ''} in ${errorCount} field${errorCount > 1 ? 's' : ''}. Please check the form below.`);
          setIsValidating(false);
          return;
        }
      }

      const errorMessage = (error as Error)?.message || 'Failed to create lead. Please try again.';
      toast.error(translateError(errorMessage));
      setIsValidating(false);
    }
  };

  // Function to translate common error messages
  const translateError = (error: string): string => {
    const errorTranslations: Record<string, string> = {
      'The email field is required.': 'Email is required',
      'The name field is required.': 'Name is required',
      'The email has already been taken.': 'Email already exists. Please use a different email.',
      'The email must be a valid email address.': 'Please enter a valid email address',
      'The phone field is required.': 'Phone number is required',
      'The mobile field is required.': 'Mobile number is required',
      'The company name field is required.': 'Company name is required',
      'The city id field is required.': 'City is required',
      'The assigned to field is required.': 'Assigned employee is required',
      'The status field is required.': 'Status is required',
      'The priority field is required.': 'Priority is required',
      'The selected priority is invalid.': 'Please select a valid priority (low, medium, high, urgent)',
      'The source field is required.': 'Source is required',
      'The industry field is required.': 'Industry is required',
      'The size field is required.': 'Company size is required',
      'The budget must be a number.': 'Budget must be a valid number',
      'The expected value must be a number.': 'Expected value must be a valid number',
      'The annual revenue must be a number.': 'Annual revenue must be a valid number',
      'The logo must be an image.': 'Logo must be a valid image file',
      'The logo may not be greater than 5120 kilobytes.': 'Logo file size must be less than 5MB',
      'The website must be a valid URL.': 'Please enter a valid website URL',
      'The linkedin must be a valid URL.': 'Please enter a valid LinkedIn URL',
      'The expected closing date must be a date after today.': 'Expected closing date must be in the future',
      'Unauthenticated.': 'Authentication required. Please log in again.',
      'Forbidden.': 'You do not have permission to perform this action.',
      'Server Error.': 'Server error occurred. Please try again later.',
      'Not Found.': 'The requested resource was not found.',
      'Validation failed.': 'Please check your input and try again.',
    };

    return errorTranslations[error] || error;
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
         <div className="h-full w-full bg-white dark:bg-gray-900">
           <div className="h-full flex flex-col">
            {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Lead</h1>
                 <p className="text-gray-600 dark:text-gray-400">Add a new potential client to the system</p>
              </div>
              <Button
                 onClick={() => router.back()} 
                variant="outline"
                 className="flex items-center gap-2"
              >
                 <ArrowLeftIcon className="h-4 w-4" />
                 Back
              </Button>
            </div>

             {/* Form */}
             <div className="flex-1 overflow-auto">
               <div className="p-6 w-full">
                 <div className="mb-6">
                   <Breadcrumb items={breadcrumbItems} />
                </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-none">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Basic Information
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter the basic lead information
                      </p>
              </div>
              
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lead Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lead Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter lead name"
                          required
                          className={`h-11 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('name')}
            </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onBlur={() => {
                            if (formData.email) {
                              const emailError = validateEmail(formData.email);
                              if (emailError) {
                                setErrors(prev => ({ ...prev, email: [emailError] }));
                              }
                            }
                          }}
                          placeholder="Enter email address"
                          required
                          className={`h-11 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('email')}
                      </div>

                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Name
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name || ''}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          placeholder="Enter company name"
                          className="h-11"
                        />
                      </div>

                      {/* Position */}
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position
                        </Label>
                        <Input
                          id="position"
                          value={formData.position || ''}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Enter position"
                          className="h-11"
                        />
                      </div>

                      {/* Registration Number */}
                      <div className="space-y-2">
                        <Label htmlFor="registration_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Registration Number
                        </Label>
                        <Input
                          id="registration_number"
                          value={formData.registration_number || ''}
                          onChange={(e) => handleInputChange('registration_number', e.target.value)}
                          placeholder="Enter registration number"
                          className="h-11"
                        />
                      </div>

                      {/* Client ID */}
                      <div className="space-y-2">
                        <Label htmlFor="client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client ID
                        </Label>
                        <Select
                          value={formData.client_id ? formData.client_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('client_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Logo Upload */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="logo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Logo
                        </Label>
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="logo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          
                          {logoPreview ? (
                            <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {logoFile?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {(logoFile?.size ? logoFile.size / 1024 : 0).toFixed(1)} KB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeLogo}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                              <div className="text-center">
                                <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Click to upload logo
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  PNG, JPG up to 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {renderFieldErrors('logo')}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter contact details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="h-11"
                        />
                      </div>

                      {/* Mobile */}
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mobile
                        </Label>
                        <Input
                          id="mobile"
                          value={formData.mobile || ''}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          placeholder="Enter mobile number"
                          className="h-11"
                        />
                      </div>

                      {/* Fax */}
                      <div className="space-y-2">
                        <Label htmlFor="fax" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Fax
                        </Label>
                        <Input
                          id="fax"
                          value={formData.fax || ''}
                          onChange={(e) => handleInputChange('fax', e.target.value)}
                          placeholder="Enter fax number"
                          className="h-11"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <Label htmlFor="city_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </Label>
                        <Select
                          value={formData.city_id ? formData.city_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('city_id', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Contact Person */}
                      <div className="space-y-2">
                        <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contact Person
                        </Label>
                        <Input
                          id="contact_person"
                          value={formData.contact_person || ''}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          placeholder="Enter contact person"
                          className="h-11"
                        />
                      </div>

                      {/* Contact Position */}
                      <div className="space-y-2">
                        <Label htmlFor="contact_position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contact Position
                        </Label>
                        <Input
                          id="contact_position"
                          value={formData.contact_position || ''}
                          onChange={(e) => handleInputChange('contact_position', e.target.value)}
                          placeholder="Enter contact position"
                          className="h-11"
                        />
                      </div>

                      {/* Alternative Contact */}
                      <div className="space-y-2">
                        <Label htmlFor="alternative_contact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Alternative Contact
                        </Label>
                        <Input
                          id="alternative_contact"
                          value={formData.alternative_contact || ''}
                          onChange={(e) => handleInputChange('alternative_contact', e.target.value)}
                          placeholder="Enter alternative contact"
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter address"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Company Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter company details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Website */}
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          onBlur={() => {
                            if (formData.website) {
                              const websiteError = validateWebsite(formData.website);
                              if (websiteError) {
                                setErrors(prev => ({ ...prev, website: [websiteError] }));
                              }
                            }
                          }}
                          placeholder="https://example.com"
                          className={`h-11 ${errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('website')}
                      </div>

                      {/* LinkedIn */}
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin || ''}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          onBlur={() => {
                            if (formData.linkedin) {
                              const linkedinError = validateLinkedIn(formData.linkedin);
                              if (linkedinError) {
                                setErrors(prev => ({ ...prev, linkedin: [linkedinError] }));
                              }
                            }
                          }}
                          placeholder="https://linkedin.com/in/username"
                          className={`h-11 ${errors.linkedin ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('linkedin')}
                      </div>

                      {/* Industry */}
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Industry
                        </Label>
                        <Select
                          value={formData.industry || ''}
                          onValueChange={(value) => handleInputChange('industry', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Size */}
                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Size
                        </Label>
                        <Select
                          value={formData.size || ''}
                          onValueChange={(value) => handleInputChange('size', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Annual Revenue */}
                      <div className="space-y-2">
                        <Label htmlFor="annual_revenue" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Annual Revenue
                        </Label>
                        <Input
                          id="annual_revenue"
                          type="number"
                          min="0"
                          value={formData.annual_revenue || ''}
                          onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                          placeholder="Enter annual revenue"
                          className={`h-11 ${errors.annual_revenue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('annual_revenue')}
                      </div>
                    </div>
                  </div>

                  {/* Lead Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lead Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter lead management details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange('status', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority */}
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Priority
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => handleInputChange('priority', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Source */}
                      <div className="space-y-2">
                        <Label htmlFor="source" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Source
                        </Label>
                        <Select
                          value={formData.source || ''}
                          onValueChange={(value) => handleInputChange('source', value as any)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="cold_call">Cold Call</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Assigned To */}
                      <div className="space-y-2">
                        <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Assigned To
                        </Label>
                        <Select
                          value={formData.assigned_to ? formData.assigned_to.toString() : ''}
                          onValueChange={(value) => handleInputChange('assigned_to', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Budget */}
                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Budget
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          min="0"
                          value={formData.budget || ''}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="Enter budget"
                          className={`h-11 ${errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('budget')}
                      </div>

                      {/* Expected Value */}
                      <div className="space-y-2">
                        <Label htmlFor="expected_value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expected Value
                        </Label>
                        <Input
                          id="expected_value"
                          type="number"
                          min="0"
                          value={formData.expected_value || ''}
                          onChange={(e) => handleInputChange('expected_value', e.target.value)}
                          placeholder="Enter expected value"
                          className={`h-11 ${errors.expected_value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('expected_value')}
                      </div>

                      {/* Expected Closing Date */}
                      <div className="space-y-2">
                        <Label htmlFor="expected_closing_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expected Closing Date
                        </Label>
                        <Popover open={expectedClosingDateOpen} onOpenChange={setExpectedClosingDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal h-11 ${
                                !formData.expected_closing_date && 'text-muted-foreground'
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.expected_closing_date ? formatDate(formData.expected_closing_date) : 'Select expected closing date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3">
                              <Calendar
                                mode="single"
                                selected={formData.expected_closing_date ? new Date(formData.expected_closing_date) : undefined}
                                onSelect={(date) => handleDateSelect('expected_closing_date', date)}
                                disabled={(date) => date < new Date()}
                                captionLayout={expectedClosingDateCaptionLayout}
                                initialFocus
                              />
                              <div className="mt-3 flex flex-col gap-3">
                                <Label htmlFor="expected-closing-date-dropdown" className="px-1 text-sm">
                                  Date Selection Mode
                                </Label>
                                <Select
                                  value={expectedClosingDateCaptionLayout}
                                  onValueChange={(value) =>
                                    setExpectedClosingDateCaptionLayout(
                                      value as "dropdown" | "dropdown-months" | "dropdown-years"
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    id="expected-closing-date-dropdown"
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
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Enter any additional notes..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lead status settings</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active Status
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enable or disable the lead
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        {renderFieldErrors('is_active')}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={createLeadMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createLeadMutation.isPending || isValidating}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(createLeadMutation.isPending || isValidating) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isValidating ? 'Validating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Lead
                        </>
                      )}
                    </Button>
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

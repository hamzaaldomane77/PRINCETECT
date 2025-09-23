'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { useClient, useUpdateClient, useCitiesLookup } from '@/modules/clients';
import { UpdateClientRequest, INDUSTRY_OPTIONS, SIZE_OPTIONS, STATUS_OPTIONS } from '@/modules/clients/types';
import { toast } from 'sonner';
import { getImageUrl, extractImagePath } from '@/lib/image-utils';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);
  
  const { data: client, isLoading: clientLoading, error } = useClient(clientId);
  const updateClientMutation = useUpdateClient();
  
  // Fetch lookup data
  const { data: cities = [], isLoading: citiesLoading } = useCitiesLookup();

  const [formData, setFormData] = useState<UpdateClientRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    mobile: '',
    company_name: '',
    position: '',
    address: '',
    website: '',
    linkedin: '',
    logo: '',
    registration_number: '',
    city_id: undefined,
    contact_person: '',
    contact_position: '',
    fax: '',
    industry: undefined,
    size: undefined,
    annual_revenue: undefined,
    is_active: true,
    status: 'active',
    notes: '',
    preferences: [],
    lead_id: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form data when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        password: '', // Don't populate password for security
        phone: client.phone || '',
        mobile: client.mobile || '',
        company_name: client.company_name || '',
        position: client.position || '',
        address: client.address || '',
        website: client.website || '',
        linkedin: client.linkedin || '',
        logo: client.logo || '',
        registration_number: client.registration_number || '',
        city_id: client.city_id || undefined,
        contact_person: client.contact_person || '',
        contact_position: client.contact_position || '',
        fax: client.fax || '',
        industry: client.industry || undefined,
        size: client.size || undefined,
        annual_revenue: client.annual_revenue ? parseFloat(client.annual_revenue) : undefined,
        is_active: Boolean(client.is_active),
        status: client.status,
        notes: client.notes || '',
        preferences: client.preferences || [],
        lead_id: client.lead_id || undefined,
      });
    }
  }, [client]);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Clients', href: '/super-admin/clients-management/clients' },
    { label: client?.name || 'Edit Client', href: `/super-admin/clients-management/clients/${clientId}` },
    { label: 'Edit' }
  ];

  const handleInputChange = (field: keyof UpdateClientRequest, value: any) => {
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
    if (!formData.name?.trim()) {
      newErrors.name = ['Client name is required'];
    }

    if (!formData.email?.trim()) {
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

    // Annual revenue validation
    if (formData.annual_revenue !== undefined && formData.annual_revenue !== null && formData.annual_revenue < 0) {
      newErrors.annual_revenue = ['Annual revenue must be a positive number'];
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

  const handlePreferencesChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: checked 
        ? [...(prev.preferences || []), preference]
        : (prev.preferences || []).filter(p => p !== preference)
    }));
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
      // Remove password if empty to avoid updating it
      const updateData = { ...formData };
      if (!updateData.password?.trim()) {
        delete updateData.password;
      }

      // Create a clean copy with only meaningful values
      const cleanedData = { ...updateData };
      
      // Remove empty string values and undefined values but keep false boolean values
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key as keyof typeof cleanedData];
        if (value === '' || value === null || (value === undefined && key !== 'is_active')) {
          delete cleanedData[key as keyof typeof cleanedData];
        }
      });

      await updateClientMutation.mutateAsync({ id: clientId, data: cleanedData });
      toast.success('Client updated successfully!');
      router.push('/super-admin/clients-management/clients');
    } catch (error) {
      console.error('Failed to update client:', error);
      
      // Handle API validation errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data?.errors) {
          // Server-side validation errors - keep all error messages
          const serverErrors: Record<string, string[]> = {};
          Object.keys(apiError.response.data.errors).forEach(field => {
            const fieldErrors = apiError.response.data.errors[field];
            serverErrors[field] = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
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

      const errorMessage = (error as Error)?.message || 'Failed to update client. Please try again.';
      if (errorMessage.includes('email')) {
        setErrors({ email: ['Email already exists. Please use a different email.'] });
        setTimeout(scrollToError, 100);
        toast.error('Email validation error. Please check the form below.');
      } else {
        toast.error(errorMessage);
      }
      setIsValidating(false);
    }
  };

  if (clientLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading client...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Error Loading Client
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  {(error as Error).message}
                </p>
                <Button 
                  onClick={() => router.push('/super-admin/clients-management/clients')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Clients
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (!client) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  Client Not Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-center">
                  The client you are trying to edit does not exist or has been deleted.
                </p>
                <Button 
                  onClick={() => router.push('/super-admin/clients-management/clients')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Clients
                </Button>
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
        <div className="h-full w-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
                <p className="text-gray-600 dark:text-gray-400">Update client information</p>
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
                        Update the basic client information
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Client Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter client name"
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

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password || ''}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Enter new password (leave empty to keep current)"
                            className="h-11 pr-10"
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Leave empty to keep current password
                        </p>
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
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Update contact details</p>
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
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </Label>
                        <Select
                          value={formData.city_id ? formData.city_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('city_id', value ? parseInt(value) : undefined)}
                          disabled={citiesLoading}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select city"} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.value} value={city.value.toString()}>
                                {city.label}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Update company details</p>
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
                          Social Media / Profile URL
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
                           placeholder="Social media or profile URL"
                          className={`h-11 ${errors.linkedin ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('linkedin')}
                      </div>

                       {/* Logo URL */}
                       <div className="space-y-2 md:col-span-2">
                         <Label htmlFor="logo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                           Company Logo URL
                         </Label>
                         <Input
                           id="logo"
                           value={formData.logo || ''}
                           onChange={(e) => handleInputChange('logo', e.target.value)}
                           placeholder="https://example.com/logo.png"
                           className={`h-11 ${errors.logo ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                         />
                         {renderFieldErrors('logo')}
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                           Enter the URL of the company logo image
                         </p>
                       </div>

                      {/* Industry */}
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Industry
                        </Label>
                        <Select
                          value={formData.industry || ''}
                          onValueChange={(value) => handleInputChange('industry', value || undefined)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRY_OPTIONS.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
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
                          onValueChange={(value) => handleInputChange('size', value || undefined)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_OPTIONS.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
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
                          onChange={(e) => handleInputChange('annual_revenue', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Enter annual revenue"
                          className={`h-11 ${errors.annual_revenue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {renderFieldErrors('annual_revenue')}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Additional settings and preferences</p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </Label>
                        <Select
                          value={formData.status || 'active'}
                          onValueChange={(value) => handleInputChange('status', value as any)}
                        >
                          <SelectTrigger className={`h-11 ${errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldErrors('status')}
                      </div>

                      {/* Preferences */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Preferences
                        </Label>
                        <div className="space-y-2">
                          {[
                            { key: 'email_notifications', label: 'Email Notifications' },
                            { key: 'sms_alerts', label: 'SMS Alerts' },
                            { key: 'marketing_emails', label: 'Marketing Emails' },
                            { key: 'newsletter', label: 'Newsletter' },
                          ].map((pref) => (
                            <div key={pref.key} className="flex items-center space-x-3">
                              <Switch
                                checked={(formData.preferences || []).includes(pref.key)}
                                onCheckedChange={(checked) => handlePreferencesChange(pref.key, checked)}
                              />
                              <Label className="text-sm text-gray-700 dark:text-gray-300">
                                {pref.label}
                              </Label>
                            </div>
                          ))}
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

                      {/* Active Status */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active Status
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Enable or disable the client
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
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={updateClientMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateClientMutation.isPending || isValidating}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(updateClientMutation.isPending || isValidating) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isValidating ? 'Validating...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Update Client
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

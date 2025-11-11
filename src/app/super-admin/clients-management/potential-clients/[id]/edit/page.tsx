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
import { ArrowLeftIcon, SaveIcon, CalendarIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useLead, useUpdateLead } from '@/modules/leads';
import { UpdateLeadRequest } from '@/modules/leads/types';
import { useCities } from '@/modules/cities';
import { useEmployees } from '@/modules/employees';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EditLeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditLeadPage({ params }: EditLeadPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateLeadRequest>({
    name: '',
    company_name: null,
    position: null,
    phone: null,
    mobile: null,
    email: '',
    address: null,
    website: null,
    linkedin: null,
    logo: null,
    registration_number: null,
    alternative_contact: null,
    status: 'contacted',
    priority: 'medium',
    source: null,
    assigned_to: null,
    notes: null,
    city_id: null,
    contact_person: null,
    contact_position: null,
    fax: null,
    budget: null,
    expected_closing_date: null,
    expected_value: null,
    industry: null,
    size: null,
    annual_revenue: null,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [expectedClosingDateOpen, setExpectedClosingDateOpen] = useState(false);
  const [expectedClosingDateCaptionLayout, setExpectedClosingDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years">("dropdown");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch lead data and lookup data
  const { data: leadResponse, isLoading, error } = useLead(leadId);
  const updateLeadMutation = useUpdateLead();
  
  // Fetch lookup data
  const { data: citiesResponse } = useCities();
  const { data: employeesResponse } = useEmployees();
  
  const cities = citiesResponse?.data?.cities || [];
  const employees = employeesResponse?.data?.employees || [];

  const lead = leadResponse?.data;
  
  // Debug: Log cities and employees when loaded
  useEffect(() => {
    if (cities.length > 0) {
      console.log('Cities loaded:', cities);
    }
  }, [cities]);
  
  useEffect(() => {
    if (employees.length > 0) {
      console.log('Employees loaded:', employees);
    }
  }, [employees]);
  
  // Debug: Log formData when it changes
  useEffect(() => {
    console.log('Current formData:', {
      city_id: formData.city_id,
      assigned_to: formData.assigned_to,
      source: formData.source,
      industry: formData.industry,
      size: formData.size,
      status: formData.status,
      priority: formData.priority,
    });
  }, [formData]);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Potential Clients', href: '/super-admin/clients-management/potential-clients' },
    { label: lead?.name || 'Edit Lead' }
  ];

  // Populate form when lead data is loaded
  useEffect(() => {
    if (lead) {
      console.log('Lead data from API:', lead);
      
      setFormData({
        name: lead.name,
        company_name: lead.company_name,
        position: lead.position,
        phone: lead.phone,
        mobile: lead.mobile,
        email: lead.email,
        address: lead.address,
        website: lead.website,
        linkedin: lead.linkedin,
        logo: lead.logo,
        registration_number: lead.registration_number,
        alternative_contact: lead.alternative_contact,
        status: lead.status,
        priority: lead.priority,
        source: lead.source,
        assigned_to: lead.assigned_to,
        notes: lead.notes,
        city_id: lead.city_id,
        contact_person: lead.contact_person,
        contact_position: lead.contact_position,
        fax: lead.fax,
        budget: lead.budget,
        expected_closing_date: lead.expected_closing_date,
        expected_value: lead.expected_value,
        industry: lead.industry,
        size: lead.size,
        annual_revenue: lead.annual_revenue,
        is_active: Boolean(lead.is_active),
      });
      
      console.log('FormData set with values:', {
        status: lead.status,
        priority: lead.priority,
        source: lead.source,
        industry: lead.industry,
        size: lead.size,
        city_id: lead.city_id,
        assigned_to: lead.assigned_to,
      });
      
      // Set logo preview if exists
      if (lead.logo) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        setLogoPreview(`${apiBaseUrl}/storage/${lead.logo}`);
      }
    }
  }, [lead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDirectInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: keyof UpdateLeadRequest, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDirectSelectChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (name: keyof UpdateLeadRequest, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Don't remove from formData.logo, as it might be the existing logo
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
  const handleDateSelect = (field: 'expected_closing_date', date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date); // Use local date without timezone conversion
      setFormData(prev => ({ ...prev, [field]: formattedDate }));
    }
    setExpectedClosingDateOpen(false);
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!formData.name?.trim()) {
      errors.name = ['Name is required'];
    }

    if (!formData.email?.trim()) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = ['Please enter a valid website URL (starting with http:// or https://)'];
    }

    if (formData.linkedin && !/^https?:\/\/.+/.test(formData.linkedin)) {
      errors.linkedin = ['Please enter a valid LinkedIn URL (starting with http:// or https://)'];
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      errors.budget = ['Budget must be a valid number'];
    }

    if (formData.expected_value && isNaN(parseFloat(formData.expected_value))) {
      errors.expected_value = ['Expected value must be a valid number'];
    }

    if (formData.annual_revenue && isNaN(parseFloat(formData.annual_revenue))) {
      errors.annual_revenue = ['Annual revenue must be a valid number'];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // If there's a new logo file, we need to use FormData
      if (logoFile) {
        const formDataToSend = new FormData();
        
        // Append all form fields
        for (const key in formData) {
          const value = formData[key as keyof UpdateLeadRequest];
          if (value !== '' && value !== null && value !== undefined) {
            formDataToSend.append(key, String(value));
          }
        }
        
        // Append logo file
        formDataToSend.append('logo', logoFile);
        
        await updateLeadMutation.mutateAsync({ id: leadId, data: formDataToSend as any });
      } else {
        // Clean formData: remove empty strings, null, and undefined values
        const dataToSend: UpdateLeadRequest = {};
        for (const key in formData) {
          const value = formData[key as keyof UpdateLeadRequest];
          if (value !== '' && value !== null && value !== undefined) {
            (dataToSend as any)[key] = value;
          }
        }

        await updateLeadMutation.mutateAsync({ id: leadId, data: dataToSend });
      }
      
      toast.success('Lead updated successfully!');
      router.push('/super-admin/clients-management/potential-clients');
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setValidationErrors(apiErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update lead');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldErrors = (fieldName: string) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 dark:text-red-400">
            • {error}
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading lead details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !lead) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Lead Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested lead could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={() => router.push('/super-admin/clients-management/potential-clients')} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Potential Clients
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
                    Edit Lead
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update lead information below
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
                    form="edit-lead-form"
                    type="submit"
                    disabled={updateLeadMutation.isPending || loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    <span>{updateLeadMutation.isPending || loading ? 'Saving...' : 'Save Changes'}</span>
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

                <form id="edit-lead-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.name ? 'border-red-500' : ''}
                          placeholder="Enter full name"
                        />
                        {renderFieldErrors('name')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange(e)}
                          className={validationErrors.email ? 'border-red-500' : ''}
                          placeholder="Enter email address"
                        />
                        {renderFieldErrors('email')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          name="mobile"
                          value={formData.mobile || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter mobile number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          name="position"
                          value={formData.position || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter position"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city_id">City</Label>
                        <Select
                          value={formData.city_id ? formData.city_id.toString() : undefined}
                          onValueChange={(value) => {
                            console.log('City selected:', value);
                            handleDirectSelectChange('city_id', value ? parseInt(value) : null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city">
                              {formData.city_id && cities.length > 0 ? (
                                cities.find((c: any) => c.id === formData.city_id)?.name || 'Unknown City'
                              ) : (
                                'Select city'
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Current value: {formData.city_id || 'none'} | Available cities: {cities.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter address"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          name="company_name"
                          value={formData.company_name || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry || undefined}
                          onValueChange={(value) => handleDirectSelectChange('industry', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="size">Company Size</Label>
                        <Select
                          value={formData.size || undefined}
                          onValueChange={(value) => handleDirectSelectChange('size', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="annual_revenue">Annual Revenue</Label>
                        <Input
                          id="annual_revenue"
                          name="annual_revenue"
                          type="number"
                          value={formData.annual_revenue || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter annual revenue"
                          className={validationErrors.annual_revenue ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('annual_revenue')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="https://example.com"
                          className={validationErrors.website ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('website')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="https://linkedin.com/in/username"
                          className={validationErrors.linkedin ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('linkedin')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registration_number">Registration Number</Label>
                        <Input
                          id="registration_number"
                          name="registration_number"
                          value={formData.registration_number || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter registration number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fax">Fax</Label>
                        <Input
                          id="fax"
                          name="fax"
                          value={formData.fax || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter fax number"
                        />
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2 mt-6">
                      <Label htmlFor="logo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Logo
                      </Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="logo"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        {logoPreview ? (
                          <div className="relative inline-block">
                            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-24 h-24 object-contain rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {logoFile?.name || 'Current logo'}
                                </p>
                                {logoFile && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {(logoFile.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={removeLogo}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="logo"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload logo</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                            </div>
                          </label>
                        )}
                      </div>
                      {renderFieldErrors('logo')}
                    </div>
                  </div>

                  {/* Lead Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleDirectSelectChange('status', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => handleDirectSelectChange('priority', value)}
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select
                          value={formData.source || undefined}
                          onValueChange={(value) => {
                            console.log('Source selected:', value);
                            handleDirectSelectChange('source', value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source">
                              {formData.source ? (
                                formData.source.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                              ) : (
                                'Select source'
                              )}
                            </SelectValue>
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
                        <p className="text-xs text-gray-500">Current value: {formData.source || 'none'}</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assigned_to">Assigned To</Label>
                        <Select
                          value={formData.assigned_to ? formData.assigned_to.toString() : undefined}
                          onValueChange={(value) => {
                            console.log('Employee selected:', value);
                            handleDirectSelectChange('assigned_to', value ? parseInt(value) : null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee">
                              {formData.assigned_to && employees.length > 0 ? (
                                employees.find((e: any) => e.id === formData.assigned_to)?.name || 'Unknown Employee'
                              ) : (
                                'Select employee'
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Current value: {formData.assigned_to || 'none'} | Available employees: {employees.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange(e)}
                        placeholder="Enter notes about this lead"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          name="budget"
                          type="number"
                          value={formData.budget || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter budget"
                          className={validationErrors.budget ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('budget')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expected_value">Expected Value</Label>
                        <Input
                          id="expected_value"
                          name="expected_value"
                          type="number"
                          value={formData.expected_value || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter expected value"
                          className={validationErrors.expected_value ? 'border-red-500' : ''}
                        />
                        {renderFieldErrors('expected_value')}
                      </div>

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
                  </div>

                  {/* Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_active">Active</Label>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                      />
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Person</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          name="contact_person"
                          value={formData.contact_person || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter contact person name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_position">Contact Position</Label>
                        <Input
                          id="contact_position"
                          name="contact_position"
                          value={formData.contact_position || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter contact position"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alternative_contact">Alternative Contact</Label>
                        <Input
                          id="alternative_contact"
                          name="alternative_contact"
                          value={formData.alternative_contact || ''}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter alternative contact"
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
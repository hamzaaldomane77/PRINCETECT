'use client';

import { useState, useRef, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, UploadIcon, SaveIcon } from '@/components/ui/icons';
import { useEmployeeLead, useUpdateLead, useLeadCities, useLeadStatuses, useLeadPriorities, useLeadEmployees, useLeadClients } from '@/modules/employee-leads';
import { UpdateEmployeeLeadRequest } from '@/modules/employee-leads/types';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

interface EditLeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditLeadPage({ params }: EditLeadPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = parseInt(resolvedParams.id);
  const updateLeadMutation = useUpdateLead();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch lookup data
  const { data: citiesData } = useLeadCities();
  const { data: statusesData } = useLeadStatuses();
  const { data: prioritiesData } = useLeadPriorities();
  const { data: employeesData } = useLeadEmployees();
  const { data: clientsData } = useLeadClients();

  // Fetch lead data
  const { data: leadResponse, isLoading } = useEmployeeLead(leadId);
  const lead = leadResponse?.data;

  const [formData, setFormData] = useState<UpdateEmployeeLeadRequest>({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    company_name: '',
    city_id: undefined,
    status: 'new',
    priority: 'medium',
    expected_value: '',
    logo: null,
    client_id: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Populate form when lead data is loaded
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        mobile: lead.mobile || '',
        company_name: lead.company_name || '',
        city_id: lead.city_id || undefined,
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        expected_value: lead.expected_value || '',
        logo: null,
        client_id: lead.client_id || undefined,
      });

      // Set logo preview if exists
      if (lead.logo) {
        setLogoPreview(getImageUrl(lead.logo));
      }
    }
  }, [lead]);

  const handleInputChange = (field: keyof UpdateEmployeeLeadRequest, value: any) => {
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
      setFormData(prev => ({ ...prev, logo: file }));
      
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
    setFormData(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.name?.trim()) {
      newErrors.name = ['Lead name is required'];
    }

    if (!formData.email?.trim()) {
      newErrors.email = ['Email is required'];
    } else if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = ['Please enter a valid email address'];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      // If there's a new logo file, use FormData
      if (logoFile) {
        const formDataToSend = new FormData();
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
          const value = formData[key as keyof UpdateEmployeeLeadRequest];
          if (value !== null && value !== undefined && key !== 'logo') {
            if (value !== '') {
              formDataToSend.append(key, String(value));
            }
          }
        });

        // Add logo file
        formDataToSend.append('logo', logoFile);

        await updateLeadMutation.mutateAsync({ leadId, data: formDataToSend });
      } else {
        // Clean formData: remove empty strings, null, and undefined values
        const dataToSend: UpdateEmployeeLeadRequest = {};
        for (const key in formData) {
          const value = formData[key as keyof UpdateEmployeeLeadRequest];
          if (value !== '' && value !== null && value !== undefined && key !== 'logo') {
            (dataToSend as any)[key] = value;
          }
        }

        await updateLeadMutation.mutateAsync({ leadId, data: dataToSend });
      }
      
      toast.success('Lead updated successfully!');
      router.push(`/employee/my-leads/${leadId}`);
    } catch (error: any) {
      console.error('Failed to update lead:', error);
      
      // Handle API validation errors
      if (error?.response?.data?.errors) {
        const serverErrors: Record<string, string[]> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          const fieldErrors = error.response.data.errors[field];
          serverErrors[field] = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
        });
        setErrors(serverErrors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to update lead. Please try again.');
      }
    }
  };

  const renderFieldErrors = (fieldName: string) => {
    const fieldErrors = errors[fieldName];
    if (!fieldErrors || fieldErrors.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {fieldErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading lead details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Lead Not Found
            </h3>
            <Button onClick={() => router.push('/employee/my-leads')}>
              Back to Leads
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Lead</h1>
              <p className="text-gray-600 dark:text-gray-400">Update lead information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Lead Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter lead name"
                    required
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {renderFieldErrors('name')}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="client1@example.com"
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {renderFieldErrors('email')}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0123456789"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="0501234567"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ''}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city_id">City</Label>
                  <Select 
                    value={formData.city_id ? String(formData.city_id) : undefined}
                    onValueChange={(value) => handleInputChange('city_id', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="city_id">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesData?.data?.map((city) => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusesData?.data?.map((status) => (
                        <SelectItem key={status.value} value={status.value || ''}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prioritiesData?.data?.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value || ''}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Value */}
                <div className="space-y-2">
                  <Label htmlFor="expected_value">Expected Value</Label>
                  <Input
                    id="expected_value"
                    type="number"
                    value={formData.expected_value || ''}
                    onChange={(e) => handleInputChange('expected_value', e.target.value)}
                    placeholder="10000"
                  />
                </div>

                {/* Client */}
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client</Label>
                  <Select 
                    value={formData.client_id ? String(formData.client_id) : undefined}
                    onValueChange={(value) => handleInputChange('client_id', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="client_id">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.data?.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name} - {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logo">Company Logo</Label>
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
                            {logoFile?.name || 'Current logo'}
                          </p>
                          {logoFile && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {(logoFile.size / 1024).toFixed(1)} KB
                            </p>
                          )}
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
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateLeadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {updateLeadMutation.isPending ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


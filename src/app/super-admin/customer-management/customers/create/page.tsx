'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeftIcon, UploadIcon } from '@/components/ui/icons';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    logo: null as File | null,
    clientName: '',
    companyName: '',
    commercialRegistrationNumber: '',
    city: '',
    website: '',
    responsiblePerson: '',
    email: '',
    phone: '',
    fax: '',
    address: '',
    
    // Step 2: Additional Information
    industry: '',
    companySize: '',
    annualRevenue: '',
    clientSource: '',
    isActive: true,
    notes: '',
    associatedPotentialClient: ''
  });

  const breadcrumbItems = [
    { label: 'Customer Management', href: '/super-admin/customer-management' },
    { label: 'Customers', href: '/super-admin/customer-management/customers' },
    { label: 'Create' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting customer data:', formData);
    // Add your submission logic here
    alert('Customer created successfully!');
    router.push('/super-admin/customer-management/customers');
  };

  const cities = [
    'Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Abha', 'Tabuk', 'Jizan'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Energy', 'Marketing', 'Construction'
  ];

  const companySizes = [
    'Small', 'Medium', 'Large', 'Enterprise'
  ];

  const clientSources = [
    'Website', 'Referral', 'Social Media', 'Advertisement', 'Cold Call', 'Trade Show'
  ];

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="min-h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-4 flex flex-col pb-20">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Customer</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new customer to your database</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className={`flex items-center space-x-3 ${currentStep === 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  01
                </div>
                <div>
                  <div className="font-semibold">Step One</div>
                  <div className="text-sm">Enter basic customer information</div>
                </div>
              </div>
              
              <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className={`flex items-center space-x-3 ${currentStep === 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  02
                </div>
                <div>
                  <div className="font-semibold">Step Two</div>
                  <div className="text-sm">Enter additional customer details</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {currentStep === 1 ? 'Step One' : 'Step Two'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 1 ? (
                    // Step 1: Basic Information
                    <div className="space-y-6">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div 
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              if (file.type.startsWith('image/')) {
                                setFormData(prev => ({
                                  ...prev,
                                  logo: file
                                }));
                              }
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label htmlFor="logo-upload" className="cursor-pointer block w-full h-full">
                            {formData.logo ? (
                              <div className="flex flex-col items-center">
                                <img 
                                  src={URL.createObjectURL(formData.logo)} 
                                  alt="Logo preview" 
                                  className="w-24 h-24 object-contain mb-2"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formData.logo.name} ({Math.round(formData.logo.size / 1024)} KB)
                                </p>
                                <button 
                                  type="button"
                                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFormData(prev => ({
                                      ...prev,
                                      logo: null
                                    }));
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                  Drag & Drop your files or{' '}
                                  <span className="text-orange-600 hover:text-orange-500">Browse</span>
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Client Name */}
                      <div className="space-y-2">
                        <Label>
                          Client Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={formData.clientName}
                          onChange={(e) => handleInputChange('clientName', e.target.value)}
                          placeholder="Enter client name"
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>

                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Enter company name"
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>

                      {/* Commercial Registration Number */}
                      <div className="space-y-2">
                        <Label>Commercial Registration Number</Label>
                        <Input
                          value={formData.commercialRegistrationNumber}
                          onChange={(e) => handleInputChange('commercialRegistrationNumber', e.target.value)}
                          placeholder="Enter commercial registration number"
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="Enter website URL"
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>

                      {/* Contact Information Section */}
                      <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                        <div className="space-y-4">
                          {/* Responsible Person */}
                          <div className="space-y-2">
                            <Label>Responsible Person</Label>
                            <Input
                              value={formData.responsiblePerson}
                              onChange={(e) => handleInputChange('responsiblePerson', e.target.value)}
                              placeholder="Enter responsible person name"
                              className="dark:bg-gray-800 dark:border-gray-600"
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Enter email address"
                              className="dark:bg-gray-800 dark:border-gray-600"
                            />
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Enter phone number"
                              className="dark:bg-gray-800 dark:border-gray-600"
                            />
                          </div>

                          {/* Fax */}
                          <div className="space-y-2">
                            <Label>Fax Number</Label>
                            <Input
                              value={formData.fax}
                              onChange={(e) => handleInputChange('fax', e.target.value)}
                              placeholder="Enter fax number"
                              className="dark:bg-gray-800 dark:border-gray-600"
                            />
                          </div>

                          {/* Address */}
                          <div className="space-y-2">
                            <Label>Address</Label>
                                                    <Textarea
                          value={formData.address}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                          placeholder="Enter address"
                          className="dark:bg-gray-800 dark:border-gray-600"
                          rows={3}
                        />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Step 2: Additional Information
                    <div className="space-y-6">
                      {/* Industry */}
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Company Size */}
                      <div className="space-y-2">
                        <Label>Company Size</Label>
                        <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Annual Revenue */}
                      <div className="space-y-2">
                        <Label>Annual Revenue</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            value={formData.annualRevenue}
                            onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                            placeholder="Enter annual revenue"
                            className="pl-8 dark:bg-gray-800 dark:border-gray-600"
                          />
                        </div>
                      </div>

                      {/* Client Source */}
                      <div className="space-y-2">
                        <Label>Client Source</Label>
                        <Select value={formData.clientSource} onValueChange={(value) => handleInputChange('clientSource', value)}>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientSources.map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Active Status */}
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                        />
                        <Label>Active</Label>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                          placeholder="Enter additional notes"
                          className="dark:bg-gray-800 dark:border-gray-600"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 pb-2">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="flex items-center space-x-2"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>

                    <div className="flex space-x-3">
                      {currentStep === 1 ? (
                        <Button
                          onClick={handleNext}
                          disabled={!formData.clientName.trim()}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Next
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                          >
                            Back to Step 1
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Create Customer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 
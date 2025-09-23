'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrashIcon } from '@/components/ui/icons';

export default function CreateMeetingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Meeting Information
    title: '',
    description: '',
    client: 'none',
    potentialClient: 'none',
    actualClient: 'none',
    
    // Step 2: Appointment Details
    date: '',
    time: '',
    duration: '',
    location: '',
    meetingType: 'In-Person',
    assignedTo: 'none',
    
    // Step 3: Status and Outcomes
    status: 'Scheduled',
    priority: 'Medium',
    outcomes: [{ outcome: '', details: '' }],
    actionItems: [{ item: '', details: '' }],
    nextSteps: [{ step: '', details: '' }],
    notes: '',
    meetingLink: '',
    isActive: true
  });

  useEffect(() => {
    console.log('Step changed to:', currentStep);
  }, [currentStep]);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings', href: '/super-admin/clients-management/meetings' },
    { label: 'Create Meeting' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleOutcomeChange = (index: number, field: string, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
  };

  const handleActionItemChange = (index: number, field: string, value: string) => {
    const newActionItems = [...formData.actionItems];
    newActionItems[index] = { ...newActionItems[index], [field]: value };
    setFormData(prev => ({ ...prev, actionItems: newActionItems }));
  };

  const handleNextStepChange = (index: number, field: string, value: string) => {
    const newNextSteps = [...formData.nextSteps];
    newNextSteps[index] = { ...newNextSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, nextSteps: newNextSteps }));
  };

  const addOutcome = () => {
    setFormData(prev => ({
      ...prev,
      outcomes: [...prev.outcomes, { outcome: '', details: '' }]
    }));
  };

  const removeOutcome = (index: number) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes.splice(index, 1);
    setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
  };

  const addActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { item: '', details: '' }]
    }));
  };

  const removeActionItem = (index: number) => {
    const newActionItems = [...formData.actionItems];
    newActionItems.splice(index, 1);
    setFormData(prev => ({ ...prev, actionItems: newActionItems }));
  };

  const addNextStep = () => {
    setFormData(prev => ({
      ...prev,
      nextSteps: [...prev.nextSteps, { step: '', details: '' }]
    }));
  };

  const removeNextStep = (index: number) => {
    const newNextSteps = [...formData.nextSteps];
    newNextSteps.splice(index, 1);
    setFormData(prev => ({ ...prev, nextSteps: newNextSteps }));
  };

  const nextStep = () => {
    console.log('Current step before:', currentStep);
    if (currentStep < 3) {
      const newStep = currentStep + 1;
      console.log('Setting step to:', newStep);
      setCurrentStep(newStep);
    }
  };

  const prevStep = () => {
    console.log('Current step before prev:', currentStep);
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log('Setting step to:', newStep);
      setCurrentStep(newStep);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your API
    alert('Meeting created successfully!');
    router.push('/super-admin/clients-management/meetings');
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Meeting</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new meeting with customers</p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8">
              <div className="w-full flex items-center">
                <div className={`w-1/3 text-center ${currentStep >= 1 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <p className="mt-2">Meeting Information</p>
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`w-1/3 text-center ${currentStep >= 2 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                  <p className="mt-2">Appointment Details</p>
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`w-1/3 text-center ${currentStep >= 3 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    3
                  </div>
                  <p className="mt-2">Status & Outcomes</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8 pb-4">
              {/* Step 1: Meeting Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-left">Meeting Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-left block">Meeting Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter meeting title"
                        required
                        className="text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-left block">Meeting Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter meeting description"
                        className="text-left min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client" className="text-left block">Client <span className="text-red-500">*</span></Label>
                      <Select value={formData.client} onValueChange={(value) => setFormData(prev => ({ ...prev, client: value }))}>                        
                        <SelectTrigger className="text-left w-full">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select an option</SelectItem>
                          <SelectItem value="1">Advanced Technology Company</SelectItem>
                          <SelectItem value="2">Hope Hospital</SelectItem>
                          <SelectItem value="3">Future Bank</SelectItem>
                          <SelectItem value="4">Knowledge University</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="potentialClient" className="text-left block">Potential Client Follow-up</Label>
                      <Select value={formData.potentialClient} onValueChange={(value) => setFormData(prev => ({ ...prev, potentialClient: value }))}>                        
                        <SelectTrigger className="text-left w-full">
                          <SelectValue placeholder="Select a potential client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select an option</SelectItem>
                          <SelectItem value="1">Saudi Tech Solutions</SelectItem>
                          <SelectItem value="2">Gulf Medical Center</SelectItem>
                          <SelectItem value="3">Riyadh Investment Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualClient" className="text-left block">Actual Client</Label>
                      <Select value={formData.actualClient} onValueChange={(value) => setFormData(prev => ({ ...prev, actualClient: value }))}>                        
                        <SelectTrigger className="text-left w-full">
                          <SelectValue placeholder="Select an actual client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select an option</SelectItem>
                          <SelectItem value="1">Advanced Technology Company</SelectItem>
                          <SelectItem value="2">Hope Hospital</SelectItem>
                          <SelectItem value="3">Future Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Appointment Details */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-left">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-left block">Meeting Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-left block">Meeting Time <span className="text-red-500">*</span></Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        className="text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-left block">Meeting Duration (minutes)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="60"
                        className="text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-left block">Meeting Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter meeting location"
                        className="text-left"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingType" className="text-left block">Meeting Type</Label>
                      <Select value={formData.meetingType} onValueChange={(value) => setFormData(prev => ({ ...prev, meetingType: value }))}>                        
                        <SelectTrigger className="text-left w-full">
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-Person">In-Person</SelectItem>
                          <SelectItem value="Virtual">Virtual</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedTo" className="text-left block">Assigned To</Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>                        
                        <SelectTrigger className="text-left w-full">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select an option</SelectItem>
                          <SelectItem value="1">Ahmed Mohammed</SelectItem>
                          <SelectItem value="2">Sara Ali</SelectItem>
                          <SelectItem value="3">Mohammed Abdullah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Status and Outcomes */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-left">Status & Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-left block">Meeting Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>                        
                          <SelectTrigger className="text-left w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Postponed">Postponed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-left block">Priority</Label>
                        <Select value={formData.priority || 'Medium'} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>                        
                          <SelectTrigger className="text-left w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Button 
                          type="button" 
                          onClick={addOutcome}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Add row
                        </Button>
                        <h3 className="text-lg font-medium text-left">Meeting Outcomes</h3>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="py-2 px-4 text-left">Details</th>
                              <th className="py-2 px-4 text-left">Outcome</th>
                              <th className="py-2 px-4 w-12"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.outcomes.map((outcome, index) => (
                              <tr key={index} className="border-t">
                                <td className="py-2 px-4">
                                  <Input
                                    value={outcome.details}
                                    onChange={(e) => handleOutcomeChange(index, 'details', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input
                                    value={outcome.outcome}
                                    onChange={(e) => handleOutcomeChange(index, 'outcome', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeOutcome(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Button 
                          type="button" 
                          onClick={addActionItem}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Add row
                        </Button>
                        <h3 className="text-lg font-medium text-left">Action Items</h3>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="py-2 px-4 text-left">Details</th>
                              <th className="py-2 px-4 text-left">Item</th>
                              <th className="py-2 px-4 w-12"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.actionItems.map((actionItem, index) => (
                              <tr key={index} className="border-t">
                                <td className="py-2 px-4">
                                  <Input
                                    value={actionItem.details}
                                    onChange={(e) => handleActionItemChange(index, 'details', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input
                                    value={actionItem.item}
                                    onChange={(e) => handleActionItemChange(index, 'item', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeActionItem(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Button 
                          type="button" 
                          onClick={addNextStep}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Add row
                        </Button>
                        <h3 className="text-lg font-medium text-left">Next Steps</h3>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="py-2 px-4 text-left">Details</th>
                              <th className="py-2 px-4 text-left">Step</th>
                              <th className="py-2 px-4 w-12"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.nextSteps.map((nextStep, index) => (
                              <tr key={index} className="border-t">
                                <td className="py-2 px-4">
                                  <Input
                                    value={nextStep.details}
                                    onChange={(e) => handleNextStepChange(index, 'details', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Input
                                    value={nextStep.step}
                                    onChange={(e) => handleNextStepChange(index, 'step', e.target.value)}
                                    className="text-left"
                                  />
                                </td>
                                <td className="py-2 px-4">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeNextStep(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-left block">Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Enter additional notes"
                          className="text-left min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingLink" className="text-left block">Meeting Link</Label>
                        <Input
                          id="meetingLink"
                          name="meetingLink"
                          value={formData.meetingLink || ''}
                          onChange={handleInputChange}
                          placeholder="Enter meeting link (Zoom, Teams, etc.)"
                          className="text-left"
                        />

                        <div className="mt-4">
                          <Label htmlFor="attachments" className="text-left block">Attachments</Label>
                          <Input
                            id="attachments"
                            name="attachments"
                            type="file"
                            className="text-left mt-1"
                          />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-start space-x-2 mt-4">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={handleSwitchChange}
                          />
                          <Label htmlFor="isActive" className="text-left">Active</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="mr-2"
                    >
                      Previous
                    </Button>
                  )}
                </div>
                <div>
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Next button clicked');
                        nextStep();
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Create Meeting
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
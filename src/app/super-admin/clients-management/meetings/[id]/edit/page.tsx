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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon, CalendarIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useMeeting, useUpdateMeeting } from '@/modules/meetings';
import { useLeadsLookup, useClientsLookup } from '@/modules/quotations';
import { toast } from 'sonner';

interface EditMeetingPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateMeetingRequest {
  lead_id?: number;
  client_id?: number;
  title: string;
  description?: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes?: number;
  location?: string;
  meeting_type?: 'in_person' | 'video_call' | 'phone_call';
  category?: 'lead' | 'client' | 'internal' | 'management';
  participants?: Record<string, string>;
  agenda?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  outcomes?: string[];
  action_items?: string[];
  next_steps?: string[];
  notes?: string;
}

export default function EditMeetingPage({ params }: EditMeetingPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = parseInt(resolvedParams.id);
  
  const { data: meetingResponse, isLoading: meetingLoading } = useMeeting(meetingId);
  const updateMeetingMutation = useUpdateMeeting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calendar state
  const [meetingDateOpen, setMeetingDateOpen] = useState(false);
  const [meetingDateCaptionLayout, setMeetingDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years" | "label">("label");
  
  // Dynamic fields state
  const [participants, setParticipants] = useState<Array<{name: string, role: string}>>([]);
  const [outcomes, setOutcomes] = useState<Array<{category: string, details: string}>>([]);
  const [actionItems, setActionItems] = useState<string[]>(['']);
  const [nextSteps, setNextSteps] = useState<string[]>(['']);

  const [formData, setFormData] = useState<UpdateMeetingRequest>({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    duration_minutes: 30,
    location: '',
    meeting_type: 'in_person',
    category: 'lead',
    agenda: '',
    status: 'scheduled',
    notes: ''
  });

  // Fetch lookup data
  const { data: leadsResponse, isLoading: leadsLoading } = useLeadsLookup();
  const { data: clientsResponse, isLoading: clientsLoading } = useClientsLookup();
  
  const leads = leadsResponse?.data || [];
  const clients = clientsResponse?.data || [];
  const meeting = meetingResponse?.data?.meeting;

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings', href: '/super-admin/clients-management/meetings' },
    { label: meeting?.title || 'Edit Meeting', href: `/super-admin/clients-management/meetings/${meetingId}` },
    { label: 'Edit' }
  ];

  // Populate form data when meeting is loaded
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        meeting_date: meeting.meeting_date || '',
        meeting_time: meeting.meeting_time || '',
        duration_minutes: meeting.duration_minutes || 30,
        location: meeting.location || '',
        meeting_type: meeting.meeting_type || 'in_person',
        category: meeting.category || 'lead',
        agenda: meeting.agenda || '',
        status: meeting.status || 'scheduled',
        notes: meeting.notes || '',
        lead_id: meeting.lead_id,
        client_id: meeting.client_id
      });

      // Populate participants
      if (meeting.participants) {
        const participantsArray = Object.entries(meeting.participants).map(([name, role]) => ({ name, role }));
        setParticipants(participantsArray);
      }

      // Populate outcomes (convert from string array to object array)
      if (meeting.outcomes && Array.isArray(meeting.outcomes)) {
        const outcomesArray = meeting.outcomes.map(outcome => {
          const [category, ...detailsParts] = outcome.split(': ');
          return {
            category: category || '',
            details: detailsParts.join(': ') || ''
          };
        });
        setOutcomes(outcomesArray);
      }

      // Populate action items
      if (meeting.action_items && Array.isArray(meeting.action_items)) {
        setActionItems(meeting.action_items.length > 0 ? meeting.action_items : ['']);
      }

      // Populate next steps
      if (meeting.next_steps && Array.isArray(meeting.next_steps)) {
        setNextSteps(meeting.next_steps.length > 0 ? meeting.next_steps : ['']);
      }
    }
  }, [meeting]);

  const handleInputChange = (field: string, value: string) => {
    // Convert "none" to empty string for API
    const processedValue = value === 'none' ? '' : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
  const handleDateSelect = (field: 'meeting_date', date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date); // Use local date without timezone conversion
      handleInputChange(field, formattedDate);
    }
    setMeetingDateOpen(false);
  };

  // Participants management
  const addParticipant = () => {
    setParticipants(prev => [...prev, { name: '', role: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: 'name' | 'role', value: string) => {
    setParticipants(prev => prev.map((participant, i) => 
      i === index ? { ...participant, [field]: value } : participant
    ));
  };

  // Outcomes management
  const addOutcome = () => {
    setOutcomes(prev => [...prev, { category: '', details: '' }]);
  };

  const removeOutcome = (index: number) => {
    setOutcomes(prev => prev.filter((_, i) => i !== index));
  };

  const updateOutcome = (index: number, field: 'category' | 'details', value: string) => {
    setOutcomes(prev => prev.map((outcome, i) => 
      i === index ? { ...outcome, [field]: value } : outcome
    ));
  };

  // Action items management
  const addActionItem = () => {
    setActionItems(prev => [...prev, '']);
  };

  const removeActionItem = (index: number) => {
    setActionItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateActionItem = (index: number, value: string) => {
    setActionItems(prev => prev.map((item, i) => i === index ? value : item));
  };

  // Next steps management
  const addNextStep = () => {
    setNextSteps(prev => [...prev, '']);
  };

  const removeNextStep = (index: number) => {
    setNextSteps(prev => prev.filter((_, i) => i !== index));
  };

  const updateNextStep = (index: number, value: string) => {
    setNextSteps(prev => prev.map((step, i) => i === index ? value : step));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }

    if (!formData.meeting_date) {
      newErrors.meeting_date = 'Meeting date is required';
    }

    if (!formData.meeting_time) {
      newErrors.meeting_time = 'Meeting time is required';
    }

    if (formData.duration_minutes && (formData.duration_minutes < 15 || formData.duration_minutes > 480)) {
      newErrors.duration_minutes = 'Duration must be between 15 and 480 minutes';
    }

    if (!formData.lead_id && !formData.client_id) {
      newErrors.lead_id = 'Either lead or client must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      // Convert participants array to object
      const participantsObj: Record<string, string> = {};
      participants.forEach(participant => {
        if (participant.name && participant.role) {
          participantsObj[participant.name] = participant.role;
        }
      });

      // Convert outcomes array to string array
      const outcomesArray: string[] = [];
      outcomes.forEach(outcome => {
        if (outcome.category && outcome.details) {
          outcomesArray.push(`${outcome.category}: ${outcome.details}`);
        }
      });

      // Filter empty action items and next steps
      const filteredActionItems = actionItems.filter(item => item.trim());
      const filteredNextSteps = nextSteps.filter(step => step.trim());

      const meetingData = {
        id: meetingId,
        ...formData,
        lead_id: formData.lead_id ? parseInt(formData.lead_id.toString()) : undefined,
        client_id: formData.client_id ? parseInt(formData.client_id.toString()) : undefined,
        description: formData.description || '',
        location: formData.location || '',
        agenda: formData.agenda || '',
        notes: formData.notes || '',
        duration_minutes: formData.duration_minutes || 30,
        meeting_type: formData.meeting_type || 'in_person',
        category: formData.category || 'lead',
        status: formData.status || 'scheduled',
        participants: Object.keys(participantsObj).length > 0 ? participantsObj : undefined,
        outcomes: outcomesArray.length > 0 ? outcomesArray : undefined,
        action_items: filteredActionItems.length > 0 ? filteredActionItems : undefined,
        next_steps: filteredNextSteps.length > 0 ? filteredNextSteps : undefined,
        // Add required fields that might be missing
        assigned_to: meeting?.assigned_to || 1,
        type: formData.category as 'lead' | 'client' | 'internal',
      };

      console.log('Updating meeting data:', meetingData);

      // Call the actual API
      await updateMeetingMutation.mutateAsync(meetingData);
      
      toast.success('Meeting updated successfully!');
      router.push(`/super-admin/clients-management/meetings/${meetingId}`);
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error('Failed to update meeting. Please try again.');
    }
  };

  if (meetingLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading meeting details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (!meeting) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    Meeting Not Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    The meeting with ID {meetingId} could not be found.
                  </p>
                  <Button
                    onClick={() => router.push('/super-admin/clients-management/meetings')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Meetings
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
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Meeting</h1>
                <p className="text-gray-600 dark:text-gray-400">Update meeting details and information</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/super-admin/clients-management/meetings/${meetingId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Details
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the meeting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meeting Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                        placeholder="Enter meeting title"
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="mt-1"
                      placeholder="Enter meeting description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lead_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lead
                      </Label>
                      <Select value={formData.lead_id?.toString() || 'none'} onValueChange={(value) => handleInputChange('lead_id', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select lead" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No lead selected</SelectItem>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id.toString()}>
                              {lead.name} - {lead.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.lead_id && <p className="text-red-500 text-sm mt-1">{errors.lead_id}</p>}
                    </div>

                    <div>
                      <Label htmlFor="client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client
                      </Label>
                      <Select value={formData.client_id?.toString() || 'none'} onValueChange={(value) => handleInputChange('client_id', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No client selected</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} - {client.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                  <CardDescription>Schedule and location information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meeting Date *
                      </Label>
                      <Popover open={meetingDateOpen} onOpenChange={setMeetingDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal h-11 ${
                              !formData.meeting_date && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.meeting_date ? formatDate(formData.meeting_date) : 'Select meeting date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3">
                            <Calendar
                              mode="single"
                              selected={formData.meeting_date ? new Date(formData.meeting_date) : undefined}
                              onSelect={(date) => handleDateSelect('meeting_date', date)}
                              disabled={(date) => date < new Date()}
                              captionLayout={meetingDateCaptionLayout}
                              initialFocus
                            />
                            <div className="mt-3 flex flex-col gap-3">
                              <Label htmlFor="meeting-date-dropdown" className="px-1 text-sm">
                                Date Selection Mode
                              </Label>
                              <Select
                                value={meetingDateCaptionLayout}
                                onValueChange={(value) =>
                                  setMeetingDateCaptionLayout(
                                    value as "dropdown" | "dropdown-months" | "dropdown-years" | "label"
                                  )
                                }
                              >
                                <SelectTrigger
                                  id="meeting-date-dropdown"
                                  size="sm"
                                  className="bg-background w-full"
                                >
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent align="center">
                                  <SelectItem value="dropdown">Month and Year</SelectItem>
                                  <SelectItem value="dropdown-months">Month Only</SelectItem>
                                  <SelectItem value="dropdown-years">Year Only</SelectItem>
                                  <SelectItem value="label">Full Calendar View</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {/* Year Counter for Full Calendar View */}
                              {meetingDateCaptionLayout === "label" && (
                                <div className="flex flex-col gap-2">
                                  <Label htmlFor="year-select" className="px-1 text-sm">
                                    Quick Year Selection
                                  </Label>
                                  <Select
                                    value={formData.meeting_date ? new Date(formData.meeting_date).getFullYear().toString() : new Date().getFullYear().toString()}
                                    onValueChange={(year) => {
                                      const currentDate = formData.meeting_date ? new Date(formData.meeting_date) : new Date();
                                      const newDate = new Date(currentDate);
                                      newDate.setFullYear(parseInt(year));
                                      handleDateSelect('meeting_date', newDate);
                                    }}
                                  >
                                    <SelectTrigger id="year-select" size="sm" className="bg-background w-full">
                                      <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent align="center">
                                      {Array.from({ length: 10 }, (_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return (
                                          <SelectItem key={year} value={year.toString()}>
                                            {year}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {errors.meeting_date && <p className="text-red-500 text-sm mt-1">{errors.meeting_date}</p>}
                    </div>

                    <div>
                      <Label htmlFor="meeting_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meeting Time *
                      </Label>
                      <Input
                        id="meeting_time"
                        type="time"
                        value={formData.meeting_time}
                        onChange={(e) => handleInputChange('meeting_time', e.target.value)}
                        className={`mt-1 ${errors.meeting_time ? 'border-red-500' : ''}`}
                      />
                      {errors.meeting_time && <p className="text-red-500 text-sm mt-1">{errors.meeting_time}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration_minutes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        min="15"
                        max="480"
                        value={formData.duration_minutes}
                        onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                        className={`mt-1 ${errors.duration_minutes ? 'border-red-500' : ''}`}
                        placeholder="30"
                      />
                      {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                    </div>

                    <div>
                      <Label htmlFor="meeting_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meeting Type
                      </Label>
                      <Select value={formData.meeting_type} onValueChange={(value) => handleInputChange('meeting_type', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_person">In Person</SelectItem>
                          <SelectItem value="video_call">Video Call</SelectItem>
                          <SelectItem value="phone_call">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="mt-1"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                  <CardDescription>Add meeting participants and their roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Meeting Participants</h3>
                    <Button
                      type="button"
                      onClick={addParticipant}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Participant
                    </Button>
                  </div>
                  
                  {participants.map((participant, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`participant-name-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </Label>
                        <Input
                          id={`participant-name-${index}`}
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          placeholder="Participant name"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`participant-role-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Role
                        </Label>
                        <Input
                          id={`participant-role-${index}`}
                          value={participant.role}
                          onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                          placeholder="Role/Position"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeParticipant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agenda */}
              <Card>
                <CardHeader>
                  <CardTitle>Agenda</CardTitle>
                  <CardDescription>Meeting agenda and discussion points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="agenda" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meeting Agenda
                    </Label>
                    <Textarea
                      id="agenda"
                      value={formData.agenda}
                      onChange={(e) => handleInputChange('agenda', e.target.value)}
                      className="mt-1"
                      placeholder="Enter meeting agenda"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Outcomes</CardTitle>
                  <CardDescription>Record the outcomes and results of the meeting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Outcomes</h3>
                    <Button
                      type="button"
                      onClick={addOutcome}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Outcome
                    </Button>
                  </div>
                  
                  {outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`outcome-category-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </Label>
                        <Input
                          id={`outcome-category-${index}`}
                          value={outcome.category}
                          onChange={(e) => updateOutcome(index, 'category', e.target.value)}
                          placeholder="e.g., Administrative, Financial, Marketing"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`outcome-details-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Details
                        </Label>
                        <Input
                          id={`outcome-details-${index}`}
                          value={outcome.details}
                          onChange={(e) => updateOutcome(index, 'details', e.target.value)}
                          placeholder="Outcome details"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeOutcome(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>Tasks and action items from the meeting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Action Items</h3>
                    <Button
                      type="button"
                      onClick={addActionItem}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Action Item
                    </Button>
                  </div>
                  
                  {actionItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`action-item-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Action Item
                        </Label>
                        <Input
                          id={`action-item-${index}`}
                          value={item}
                          onChange={(e) => updateActionItem(index, e.target.value)}
                          placeholder="Enter action item"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeActionItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Follow-up actions and next steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Next Steps</h3>
                    <Button
                      type="button"
                      onClick={addNextStep}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Next Step
                    </Button>
                  </div>
                  
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`next-step-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Next Step
                        </Label>
                        <Input
                          id={`next-step-${index}`}
                          value={step}
                          onChange={(e) => updateNextStep(index, e.target.value)}
                          placeholder="Enter next step"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeNextStep(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Status, notes, and other details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="postponed">Postponed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="mt-1"
                        placeholder="Additional notes"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateMeetingMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {updateMeetingMutation.isPending ? 'Updating Meeting...' : 'Update Meeting'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

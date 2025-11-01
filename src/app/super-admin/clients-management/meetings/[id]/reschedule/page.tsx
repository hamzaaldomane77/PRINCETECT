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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CalendarIcon, SaveIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMeeting } from '@/modules/meetings';
import { toast } from 'sonner';

interface ReschedulePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface RescheduleRequest {
  meeting_date: string;
  meeting_time: string;
  reason: string;
}

export default function ReschedulePage({ params }: ReschedulePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = parseInt(resolvedParams.id);
  
  const { data: meetingResponse, isLoading: meetingLoading } = useMeeting(meetingId);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calendar state
  const [meetingDateOpen, setMeetingDateOpen] = useState(false);
  const [meetingDateCaptionLayout, setMeetingDateCaptionLayout] = useState<"dropdown" | "dropdown-months" | "dropdown-years" | "label">("label");

  const [formData, setFormData] = useState<RescheduleRequest>({
    meeting_date: '',
    meeting_time: '',
    reason: ''
  });

  const meeting = meetingResponse?.data?.meeting;

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings', href: '/super-admin/clients-management/meetings' },
    { label: meeting?.title || 'Meeting Details', href: `/super-admin/clients-management/meetings/${meetingId}` },
    { label: 'Reschedule' }
  ];

  // Populate form data when meeting is loaded
  useEffect(() => {
    if (meeting) {
      setFormData({
        meeting_date: meeting.meeting_date || '',
        meeting_time: meeting.meeting_time || '',
        reason: ''
      });
    }
  }, [meeting]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.meeting_date) {
      newErrors.meeting_date = 'Meeting date is required';
    }

    if (!formData.meeting_time) {
      newErrors.meeting_time = 'Meeting time is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for rescheduling is required';
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

    setLoading(true);
    try {
      const response = await fetch(`https://princetect.peaklink.pro/api/v1/admin/meetings/${meetingId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Reschedule Meeting API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        requestData: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reschedule Meeting Success Data:', data);
        toast.success('Meeting rescheduled successfully!');
        router.push(`/super-admin/clients-management/meetings/${meetingId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Reschedule Meeting Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        toast.error(`Failed to reschedule meeting: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Reschedule Meeting Network Error:', error);
      toast.error('Failed to reschedule meeting. Please try again.');
    } finally {
      setLoading(false);
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reschedule Meeting</h1>
                <p className="text-gray-600 dark:text-gray-400">Update the date and time for "{meeting.title}"</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/super-admin/clients-management/meetings/${meetingId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Meeting
              </Button>
            </div>

            {/* Current Meeting Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current Meeting Details</CardTitle>
                <CardDescription>Current schedule information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Date</Label>
                    <p className="text-gray-900 dark:text-white">{formatDate(meeting.meeting_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Time</Label>
                    <p className="text-gray-900 dark:text-white">{meeting.meeting_time}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</Label>
                    <p className="text-gray-900 dark:text-white">{meeting.duration_minutes} minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reschedule Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Schedule</CardTitle>
                  <CardDescription>Set the new date and time for the meeting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Meeting Date *
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
                            {formData.meeting_date ? formatDate(formData.meeting_date) : 'Select new meeting date'}
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
                        New Meeting Time *
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

                  <div>
                    <Label htmlFor="reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason for Rescheduling *
                    </Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      className={`mt-1 ${errors.reason ? 'border-red-500' : ''}`}
                      placeholder="Please provide a reason for rescheduling this meeting"
                      rows={4}
                    />
                    {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/super-admin/clients-management/meetings/${meetingId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Rescheduling...' : 'Reschedule Meeting'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

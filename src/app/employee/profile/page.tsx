'use client';

import { useState } from 'react';
import { EmployeeLayout } from '@/components/layout/employee-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  BuildingIcon,
  BriefcaseIcon,
  EditIcon
} from '@/components/ui/icons';
import { useEmployeeProfile, useUpdateEmployeeProfile } from '@/modules/employee-profile';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
  const { data: profileResponse, isLoading, refetch } = useEmployeeProfile();
  const updateProfileMutation = useUpdateEmployeeProfile();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    work_mobile: '',
    personal_mobile: '',
    office_phone: '',
    home_phone: '',
    personal_email: '',
    address: ''
  });

  const profile = profileResponse?.data;

  // Format date helper function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Open edit dialog
  const handleEditClick = () => {
    if (!profile) return;
    
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      work_mobile: profile.work_mobile || '',
      personal_mobile: profile.personal_mobile || '',
      office_phone: profile.office_phone || '',
      home_phone: profile.home_phone || '',
      personal_email: profile.personal_email || '',
      address: profile.address || ''
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setEditDialogOpen(true);
  };

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        data: formData,
        photo: photoFile || undefined
      });
      
      toast.success('Profile updated successfully!');
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </EmployeeLayout>
    );
  }

  if (!profile) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Profile Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load profile information
            </p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="p-6 space-y-6">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                {profile.photo && profile.photo !== '' ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <img
                      src={profile.photo}
                      alt={profile.full_name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-2xl">
                    <span className="text-5xl font-bold text-white">
                      {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900"></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.full_name}
                </h1>
                <p className="text-blue-100 text-lg mb-3">
                  {profile.job_title?.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {profile.employee_id}
                  </Badge>
                  {profile.is_manager && (
                    <Badge className="bg-orange-500/90 text-white border-orange-400/50">
                      Manager
                    </Badge>
                  )}
                  {profile.is_department_manager && (
                    <Badge className="bg-purple-500/90 text-white border-purple-400/50">
                      Department Manager
                    </Badge>
                  )}
                  <Badge className={`${
                    profile.status === 'active' ? 'bg-green-500/90' : 'bg-gray-500/90'
                  } text-white`}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={handleEditClick}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            >
              <EditIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {profile.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Marital Status</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {profile.marital_status}
                  </p>
                </div>
                {profile.birth_date && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Birth Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(profile.birth_date)}
                    </p>
                  </div>
                )}
                {profile.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.address}
                    </p>
                  </div>
                )}
                {profile.city && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.city.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MailIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contact Information
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <MailIcon className="w-4 h-4" />
                    <span className="text-sm">Work Email</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.work_email}
                  </p>
                </div>
                {profile.personal_email && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <MailIcon className="w-4 h-4" />
                      <span className="text-sm">Personal Email</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.personal_email}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">Work Mobile</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                    {profile.work_mobile}
                  </p>
                </div>
                {profile.personal_mobile && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span className="text-sm">Personal Mobile</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {profile.personal_mobile}
                    </p>
                  </div>
                )}
                {profile.office_phone && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span className="text-sm">Office Phone</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {profile.office_phone}
                    </p>
                  </div>
                )}
                {profile.home_phone && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span className="text-sm">Home Phone</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                      {profile.home_phone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Work Information
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.department && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <BuildingIcon className="w-4 h-4" />
                      <span className="text-sm">Department</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.department.name}
                    </p>
                  </div>
                )}
                {profile.job_title && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span className="text-sm">Job Title</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.job_title.name}
                    </p>
                  </div>
                )}
                {profile.employee_type && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Employee Type</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.employee_type.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hire Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(profile.hire_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {(photoPreview && photoPreview !== '') || (profile.photo && profile.photo !== '') ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={photoPreview || profile.photo || ''}
                          alt="Profile"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                        <span className="text-2xl font-bold text-gray-400">
                          {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="flex-1"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Choose Photo
                      </Button>
                      {(photoPreview || photoFile) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemovePhoto}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="personal_email">Personal Email</Label>
                <Input
                  id="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                  placeholder="personal@example.com"
                />
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_mobile">Work Mobile</Label>
                  <Input
                    id="work_mobile"
                    value={formData.work_mobile}
                    onChange={(e) => setFormData({ ...formData, work_mobile: e.target.value })}
                    placeholder="0501234567"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personal_mobile">Personal Mobile</Label>
                  <Input
                    id="personal_mobile"
                    value={formData.personal_mobile}
                    onChange={(e) => setFormData({ ...formData, personal_mobile: e.target.value })}
                    placeholder="0551234567"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="office_phone">Office Phone</Label>
                  <Input
                    id="office_phone"
                    value={formData.office_phone}
                    onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
                    placeholder="0112345678"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home_phone">Home Phone</Label>
                  <Input
                    id="home_phone"
                    value={formData.home_phone}
                    onChange={(e) => setFormData({ ...formData, home_phone: e.target.value })}
                    placeholder="0112345679"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="الرياض، حي النخيل، شارع الملك فهد"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={updateProfileMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
}

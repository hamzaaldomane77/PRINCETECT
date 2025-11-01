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
import { ArrowLeftIcon, UploadIcon, TrashIcon, FileTextIcon, DownloadIcon } from '@/components/ui/icons';
import { useMeeting } from '@/modules/meetings';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AttachmentsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Attachment {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
  description?: string;
  created_at: string;
}

export default function AttachmentsPage({ params }: AttachmentsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingId = parseInt(resolvedParams.id);
  
  const { data: meetingResponse, isLoading: meetingLoading } = useMeeting(meetingId);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const meeting = meetingResponse?.data?.meeting;

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Meetings', href: '/super-admin/clients-management/meetings' },
    { label: meeting?.title || 'Meeting Details', href: `/super-admin/clients-management/meetings/${meetingId}` },
    { label: 'Attachments' }
  ];

  // Fetch attachments
  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://princetect.peaklink.pro/api/v1/admin/meetings/${meetingId}/attachments`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });
      
      console.log('Fetch Attachments API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch Attachments Success Data:', data);
        setAttachments(data.data?.attachments || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch Attachments Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        toast.error(`Failed to load attachments: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fetch Attachments Network Error:', error);
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) {
      fetchAttachments();
    }
  }, [meetingId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);

      const response = await fetch(`https://princetect.peaklink.pro/api/v1/admin/meetings/${meetingId}/attachments`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });

      console.log('Upload Attachment API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload Attachment Success Data:', data);
        toast.success('File uploaded successfully!');
        setSelectedFile(null);
        setDescription('');
        fetchAttachments(); // Refresh attachments list
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload Attachment Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        toast.error(`Failed to upload file: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload Attachment Network Error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!attachmentToDelete) return;

    try {
      const response = await fetch(`https://princetect.peaklink.pro/api/v1/admin/meetings/${meetingId}/attachments/${attachmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      console.log('Delete Attachment API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Delete Attachment Success Data:', data);
        toast.success('Attachment deleted successfully!');
        fetchAttachments(); // Refresh attachments list
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete Attachment Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        toast.error(`Failed to delete attachment: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete Attachment Network Error:', error);
      toast.error('Failed to delete attachment');
    } finally {
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting Attachments</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage files and documents for "{meeting.title}"</p>
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

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload New Attachment</CardTitle>
                <CardDescription>Add files and documents to this meeting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select File
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    className="mt-1"
                    accept="*/*"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Enter a description for this file"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attachments List */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments ({attachments.length})</CardTitle>
                <CardDescription>Files and documents attached to this meeting</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Loading attachments...</div>
                    </div>
                  </div>
                ) : attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{formatFileSize(attachment.size)}</span>
                              <span>•</span>
                              <span>{attachment.type}</span>
                              <span>•</span>
                              <span>Uploaded {formatDate(attachment.created_at)}</span>
                            </div>
                            {attachment.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {attachment.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(attachment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <DownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAttachment(attachment)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📎</div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No Attachments
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      No files have been uploaded to this meeting yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the attachment &quot;{attachmentToDelete?.name}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Attachment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

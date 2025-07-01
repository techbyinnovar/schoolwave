'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, X, Send, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';
import { cloudinaryUpload } from '@/utils/cloudinaryUpload';

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [cloudinaryMedia, setCloudinaryMedia] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<Array<{
    timestamp: string;
    type: 'info' | 'success' | 'error';
    message: string;
    details?: any;
  }>>([]);

  const addLog = (type: 'info' | 'success' | 'error', message: string, details?: any) => {
    setLogs(prevLogs => [
      {
        timestamp: new Date().toISOString(),
        type,
        message,
        details
      },
      ...prevLogs
    ]);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMediaUrl('');
      setMediaPreview('');
      setMediaType('');
      setCloudinaryMedia('');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.alert('Error: File size exceeds 5MB limit');
      addLog('error', 'File size exceeds limit', { fileSize: file.size });
      e.target.value = '';
      return;
    }

    // Check allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      window.alert('Error: Unsupported file type. Allowed: JPG, PNG, GIF, MP4, PDF');
      addLog('error', 'Unsupported file type', { fileType: file.type });
      e.target.value = '';
      return;
    }
    
    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setMediaPreview(result);
      setMediaUrl(result); // Temporarily store the data URL (will be replaced by Cloudinary URL)
    };
    reader.readAsDataURL(file);
    setMediaType(file.type);
    
    // Upload to Cloudinary
    uploadToCloudinary(file);
    
    addLog('info', `Media file selected: ${file.name}`, { 
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name
    });
  };
  
  const uploadToCloudinary = async (file: File) => {
    try {
      addLog('info', 'Uploading media to Cloudinary...');
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing');
      }
      
      const result = await cloudinaryUpload(file, {
        cloudName,
        uploadPreset,
        folder: 'whatsapp-media',
        onProgress: (progress) => {
          addLog('info', `Upload progress: ${progress}%`);
        }
      });
      
      setCloudinaryMedia(result.url);
      addLog('success', 'Media uploaded to Cloudinary', { 
        url: result.url,
        publicId: result.public_id 
      });
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      addLog('error', 'Failed to upload media to Cloudinary', error);
      window.alert('Failed to upload media. Please try again with a smaller file or different format.');
    }
  };
  
  const handleCloudinarySuccess = useCallback((result: any) => {
    if (result?.secure_url) {
      setCloudinaryMedia(result.secure_url);
      addLog('success', 'Media uploaded to Cloudinary', { 
        url: result.secure_url,
        publicId: result.public_id 
      });
    }
  }, []);
  
  const clearMedia = () => {
    setMediaUrl('');
    setMediaPreview('');
    setMediaType('');
    setCloudinaryMedia('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addLog('info', 'Media cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      window.alert('Error: Please enter a phone number');
      addLog('error', 'Missing phone number');
      return;
    }
    
    if (!message) {
      window.alert('Error: Please enter a message');
      addLog('error', 'Missing message');
      return;
    }
    
    setLoading(true);
    addLog('info', `Sending WhatsApp message to ${phoneNumber}${mediaUrl ? ' with media attachment' : ''}`);
    
    try {
      // Prefer Cloudinary URL over data URL if available
      const finalMediaUrl = cloudinaryMedia || mediaUrl;
      
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: phoneNumber, 
          message,
          mediaUrl: finalMediaUrl || undefined
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        window.alert('Success: Message sent successfully!');
        addLog('success', 'Message sent successfully', data);
      } else {
        window.alert(`Error: Failed to send message: ${data.error || 'Unknown error'}`);
        addLog('error', `Failed to send message: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      window.alert('Error: Problem sending message. Check console for details.');
      addLog('error', 'Exception occurred while sending message', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLogTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatJsonDisplay = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Test WhatsApp Message</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Message</CardTitle>
              <CardDescription>
                Send a test WhatsApp message to verify connectivity and debug issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number with country code (e.g., +2348012345678)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Include country code (e.g., +234 for Nigeria)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="media">Media Attachment (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="media"
                      type="file"
                      onChange={handleMediaChange}
                      accept="image/jpeg,image/png,image/gif,video/mp4,application/pdf"
                      className="flex-1"
                    />
                    {mediaUrl && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={clearMedia}
                        className="whitespace-nowrap"
                      >
                        Clear Media
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported: JPG, PNG, GIF, MP4, PDF (max 5MB)
                  </p>
                  
                  <div className="mt-4">
                    <Label>Upload via Cloudinary (Recommended)</Label>
                    <div className="mt-2">
                      <CloudinaryUploadWidget
                        onUploadSuccess={handleCloudinarySuccess}
                        buttonText="Upload to Cloudinary"
                        folder="whatsapp-media"
                        resourceType="auto"
                      />
                    </div>
                    {cloudinaryMedia && (
                      <div className="mt-2 p-2 bg-gray-50 border rounded text-sm break-all">
                        <p className="font-medium mb-1">Cloudinary URL (will be used for WhatsApp):</p>
                        <p className="text-xs text-gray-600">{cloudinaryMedia}</p>
                      </div>
                    )}
                  </div>
                  
                  {mediaPreview && mediaType.startsWith('image/') && (
                    <div className="mt-2 border rounded overflow-hidden">
                      <img 
                        src={mediaPreview} 
                        alt="Selected media preview" 
                        className="max-h-64 mx-auto" 
                      />
                    </div>
                  )}
                  
                  {mediaPreview && mediaType === 'application/pdf' && (
                    <div className="mt-2 p-3 border rounded bg-gray-50 text-center">
                      PDF document selected
                    </div>
                  )}
                  
                  {mediaPreview && mediaType.startsWith('video/') && (
                    <div className="mt-2 border rounded overflow-hidden">
                      <video 
                        src={mediaPreview} 
                        controls 
                        className="max-h-64 w-full" 
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
                
                {mediaUrl && !cloudinaryMedia && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-amber-700">
                      ⚠️ For reliable media delivery, we recommend uploading your media to Cloudinary using the button above.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
              <CardDescription>
                Detailed logs for debugging WhatsApp message delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-auto rounded border p-4">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No logs yet. Send a message to see logs.</p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <div key={index} className="border-b pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          {log.type === 'success' ? (
                            <Badge variant="success" className="h-5 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Success
                            </Badge>
                          ) : log.type === 'error' ? (
                            <Badge variant="destructive" className="h-5 flex items-center gap-1">
                              <X className="h-3 w-3" /> Error
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="h-5 flex items-center gap-1">
                              Info
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatLogTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        
                        {log.details && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              View details
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                              {formatJsonDisplay(log.details)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {logs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

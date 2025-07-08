'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// Using Card component instead of Alert since Alert is not available
import { CheckCircle, AlertCircle, Upload, X, RefreshCw } from 'lucide-react';
// Tabs component not available, using div with conditional rendering instead
// Removed CloudinaryUploadWidget import to fix runtime error

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'error' | 'success'; message: string; timestamp: Date }>>([]);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [cloudinaryMedia, setCloudinaryMedia] = useState('');
  const [attachmentTab, setAttachmentTab] = useState<'cloudinary' | 'url'>('cloudinary');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file);
      setCloudinaryMedia(fileUrl);
      addLog('info', `File selected: ${file.name}`);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !message) {
      setResult({ success: false, message: 'Email and message are required' });
      addLog('error', 'Email and message are required');
      return;
    }

    setSending(true);
    setResult(null);
    addLog('info', `Sending email to ${email}`);
    
    try {
      // Prefer Cloudinary URL over data URL if available
      const finalAttachmentUrl = cloudinaryMedia || attachmentUrl;
      
      // Log the attachment URL for debugging
      if (finalAttachmentUrl) {
        addLog('info', `Using attachment URL: ${finalAttachmentUrl.substring(0, 30)}...`);
      }
      
      const payload = { 
        to: email, 
        subject,
        message
      };
      
      // Only include attachmentUrl if it's a valid URL
      if (finalAttachmentUrl && finalAttachmentUrl.startsWith('http')) {
        Object.assign(payload, { attachmentUrl: finalAttachmentUrl });
      }
      
      addLog('info', `Sending payload: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({ success: true, message: 'Email sent successfully!' });
        addLog('success', 'Email sent successfully!');
      } else {
        setResult({ success: false, message: data.error || 'Failed to send email' });
        addLog('error', `Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'An error occurred' });
      addLog('error', `Error: ${error.message || 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test Email Sender</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Use this form to test email sending functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (HTML supported)</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Attachment</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant={attachmentTab === 'cloudinary' ? 'default' : 'outline'}
                      onClick={() => setAttachmentTab('cloudinary')}
                      className="w-full"
                    >
                      Cloudinary Upload
                    </Button>
                    <Button 
                      type="button" 
                      variant={attachmentTab === 'url' ? 'default' : 'outline'}
                      onClick={() => setAttachmentTab('url')}
                      className="w-full"
                    >
                      URL
                    </Button>
                  </div>
                  
                  {attachmentTab === 'cloudinary' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                          </div>
                          <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileInputChange}
                            accept="image/*,application/pdf"
                          />
                        </label>
                      </div>
                      {cloudinaryMedia && (
                        <div className="flex items-center justify-between p-2 border rounded mt-2">
                          <span className="text-sm truncate max-w-[200px]">
                            {cloudinaryMedia.split('/').pop() || 'Selected file'}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCloudinaryMedia('');
                              addLog('info', 'File attachment removed');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {attachmentTab === 'url' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/file.pdf"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                      />
                      {attachmentUrl && (
                        <div className="text-sm text-gray-500">
                          URL must be publicly accessible
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setEmail('');
                  setSubject('');
                  setMessage('');
                  setAttachmentUrl('');
                  setCloudinaryMedia('');
                  setResult(null);
                  addLog('info', 'Form cleared');
                }}
              >
                Clear
              </Button>
              <Button onClick={handleSendEmail} disabled={sending}>
                {sending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </Button>
            </CardFooter>
          </Card>

          {result && (
            <Card
              className={`mt-4 ${
                result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium">{result.success ? 'Success' : 'Error'}</h3>
                    <p className="text-sm">{result.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs</CardTitle>
                <CardDescription>Activity and debug information</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] overflow-y-auto border rounded p-2 bg-slate-50 dark:bg-slate-900">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground p-4">
                    No logs yet. Send an email to see activity.
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className={`mb-1 p-2 rounded text-sm ${
                        log.type === 'error'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : log.type === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="font-mono text-xs opacity-70 mr-2">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span>{log.message}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

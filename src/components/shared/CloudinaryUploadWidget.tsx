"use client";

import { CldUploadWidget, CldUploadWidgetProps } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component from shadcn/ui
import { UploadCloud, Image as ImageIcon, Video as VideoIcon, File as FileIcon, XCircle } from 'lucide-react';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (result: { url: string; public_id: string; resource_type: string }) => void;
  onUploadError?: (error: any) => void;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  buttonText?: string;
  initialValue?: string; // To display an already uploaded file URL
  label?: string;
  className?: string;
  clearable?: boolean;
  onClear?: () => void; // Callback when the displayed file is cleared
}

const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({
  onUploadSuccess,
  onUploadError,
  folder,
  resourceType = 'auto', // Default to 'auto' to let Cloudinary detect
  buttonText = 'Upload File',
  initialValue,
  label,
  className,
  clearable = false,
  onClear
}) => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial value when component mounts or initialValue prop changes
    setUploadedUrl(initialValue || null);
  }, [initialValue]);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error(
      'Cloudinary configuration error: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set.'
    );
    return (
      <div className={`p-4 border border-red-300 rounded-md bg-red-50 text-red-700 ${className}`}>
        Cloudinary upload is not configured. Please check environment variables.
      </div>
    );
  }



  const handleSuccess = (result: any) => {
    if (result.event === 'success' && result.info) {
      const secureUrl = result.info.secure_url;
      setUploadedUrl(secureUrl);
      setError(null);
      onUploadSuccess({ 
        url: secureUrl, 
        public_id: result.info.public_id, 
        resource_type: result.info.resource_type 
      });
    } 
  };

  const handleError = (errorResult: any) => {
    console.error('Cloudinary Upload Error:', errorResult);
    setError('Upload failed. Please try again.');
    if (onUploadError) {
      onUploadError(errorResult);
    }
  };

  const handleClear = () => {
    setUploadedUrl(null); // Clear local display
    setError(null);
    if (onClear) {
      onClear(); // Notify parent to clear its state (e.g., form field)
    }
  };

  const getFileIcon = (url: string | null) => {
    if (!url) return <UploadCloud size={20} className="mr-2 text-gray-500" />;
    // Basic check based on common extensions, can be more robust
    if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return <ImageIcon size={20} className="mr-2 text-blue-500" />;
    if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i)) return <VideoIcon size={20} className="mr-2 text-green-500" />;
    return <FileIcon size={20} className="mr-2 text-gray-500" />;
  };

  // Determine what to display: current upload, initial value, or nothing
  const displayUrl = uploadedUrl || initialValue;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <CldUploadWidget
        uploadPreset={uploadPreset} // Essential for unsigned uploads
        options={{
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1,
          folder: folder,
          resource_type: resourceType,
        }}
        onSuccess={handleSuccess}
        onError={handleError}
        // signatureEndpoint can be used for signed uploads if you implement a backend route
        // signatureEndpoint="/api/sign-cloudinary-params"
      >
        {({ open }) => {
          return (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => open()} 
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UploadCloud size={18} className="mr-2" />
              {buttonText}
            </Button>
          );
        }}
      </CldUploadWidget>
      
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {displayUrl && (
        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            {getFileIcon(displayUrl)}
            <a 
              href={displayUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:underline truncate"
              title={displayUrl}
            >
              {displayUrl.substring(displayUrl.lastIndexOf('/') + 1)}
            </a>
          </div>
          {clearable && (
            <button 
              type="button" 
              onClick={handleClear} 
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              title="Clear uploaded file"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploadWidget;

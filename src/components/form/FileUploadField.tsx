import React, { useRef, useState } from 'react';
import { cloudinaryUpload, CloudinaryUploadResult } from '@/utils/cloudinaryUpload';

interface FileUploadFieldProps {
  value: string | string[];
  onChange: (val: string | string[]) => void;
  label: string;
  required?: boolean;
  maxSize?: number; // MB
  allowedTypes?: string;
  allowMultiple?: boolean;
}

export default function FileUploadField({ value, onChange, label, required, maxSize, allowedTypes, allowMultiple }: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Get Cloudinary config from env
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    // Validate file size and type
    for (let file of fileArr) {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds max size of ${maxSize}MB.`);
        return;
      }
      if (allowedTypes && !file.type.match(allowedTypes.replace(/\./g, ''))) {
        setError(`File ${file.name} is not an allowed type.`);
        return;
      }
    }
    setUploading(true);
    setProgress(0);
    try {
      const urls: string[] = [];
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const result: CloudinaryUploadResult = await cloudinaryUpload(file, {
          uploadPreset,
          cloudName,
          onProgress: p => setProgress(p),
        });
        urls.push(result.secure_url || result.url);
      }
      if (allowMultiple) {
        onChange(urls);
      } else {
        onChange(urls[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (idx: number) => {
    if (Array.isArray(value)) {
      const newArr = value.slice();
      newArr.splice(idx, 1);
      onChange(newArr);
    }
  };

  return (
    <div>
      <label className="block font-medium mb-1">{label}{required && ' *'}</label>
      <input
        ref={inputRef}
        type="file"
        className="file-input file-input-bordered w-full"
        accept={allowedTypes}
        multiple={allowMultiple}
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <div className="text-xs text-blue-600 mt-1">Uploading... {progress}%</div>}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      {/* Show uploaded files */}
      {value && Array.isArray(value) && value.length > 0 && (
        <ul className="mt-2 space-y-1">
          {value.map((url, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs">
              <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{url}</a>
              <button type="button" className="btn btn-xs btn-error" onClick={() => handleRemove(idx)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {value && typeof value === 'string' && (
        <div className="mt-2 text-xs flex items-center gap-2">
          <a href={value} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">{value}</a>
          <button type="button" className="btn btn-xs btn-error" onClick={() => onChange('')}>Remove</button>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useRef, useState } from "react";
import CloudinaryUploadWidget from '@/components/shared/CloudinaryUploadWidget';

interface BannerImageUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
}

export default function BannerImageUploader({ value, onChange }: BannerImageUploaderProps) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Banner Image</label>
      <CloudinaryUploadWidget
        onUploadSuccess={result => onChange(result.url)}
        initialValue={value}
        label="Upload or select banner image"
        resourceType="image"
        buttonText={value ? 'Replace Banner Image' : 'Upload Banner Image'}
        clearable={!!value}
        onClear={() => onChange(null)}
        folder="form-banners"
        className="w-full"
      />
      <div className="text-xs text-gray-500">Recommended size: 1200x300px or similar. Large images will be scaled down.</div>
    </div>
  );
}

// Basic type definitions for Cloudinary to satisfy TypeScript's strict mode.
// This is not a complete definition but covers the parts used in the project.

declare module 'cloudinary' {
  export interface UploadApiErrorResponse {
    message: string;
    name: string;
    http_code: number;
  }

  export interface UploadApiResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: 'image' | 'video' | 'raw' | 'auto';
    created_at: string;
    tags: string[];
    pages: number;
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    original_filename: string;
    [key: string]: any;
  }

  export type UploadResponseCallback = (
    error?: UploadApiErrorResponse,
    result?: UploadApiResponse
  ) => void;

  export interface UploadOptions {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    [key: string]: any;
  }

  export interface Uploader {
    upload: (
      file: string,
      options: UploadOptions,
      callback?: UploadResponseCallback
    ) => Promise<UploadApiResponse>;
  }

  export interface ConfigOptions {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    secure?: boolean;
  }

  export interface CloudinaryV2 {
    config: (options: ConfigOptions) => void;
    uploader: Uploader;
  }

  const cloudinary: {
    v2: CloudinaryV2;
  };

  export default cloudinary;
}

// Utility for uploading files to Cloudinary using unsigned upload preset
// Usage: await cloudinaryUpload(file, { uploadPreset, cloudName })

export interface CloudinaryUploadOptions {
  uploadPreset: string;
  cloudName: string;
  folder?: string;
  onProgress?: (percent: number) => void;
}

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  original_filename: string;
  [key: string]: any;
}

export async function cloudinaryUpload(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const { uploadPreset, cloudName, folder, onProgress } = options;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = evt => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed: ' + xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

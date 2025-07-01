// Server-side utility for uploading files to Cloudinary using the v2 API
import cloudinary from 'cloudinary';

// Initialize Cloudinary with credentials from environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  original_filename?: string;
  [key: string]: any;
}

/**
 * Uploads a base64 data URL to Cloudinary
 * @param base64 - Base64 data URL (e.g., "data:image/jpeg;base64,...")
 * @param folder - Cloudinary folder to upload to
 * @returns CloudinaryUploadResult with URL and other metadata
 */
export async function uploadBase64ToCloudinary(
  base64: string,
  folder = 'whatsapp-media'
): Promise<CloudinaryUploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are missing in environment variables');
  }

  try {
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        base64,
        {
          folder,
          resource_type: 'auto', // Auto-detect resource type (image, video, etc.)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload media to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

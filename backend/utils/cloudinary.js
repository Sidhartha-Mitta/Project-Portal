import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary function
export const configureCloudinary = () => {
  try {
    if (!cloudinary.config().cloud_name) {
      console.log('Configuring Cloudinary...');

      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Missing Cloudinary environment variables');
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      console.log('Cloudinary configured successfully');
    }
  } catch (error) {
    console.error('Cloudinary configuration error:', error.message);
    throw error;
  }
};

// Create storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project-portal',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'webm', 'mp3', 'wav'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// Create multer upload middleware
export const upload = multer({ storage });

// Direct upload function for team messages
export const uploadToCloudinary = async (fileInput, fileName, mimeType) => {
  try {
    console.log('uploadToCloudinary called with:', {
      inputType: typeof fileInput,
      isBuffer: Buffer.isBuffer(fileInput),
      fileName,
      mimeType,
      inputLength: Buffer.isBuffer(fileInput) ? fileInput.length : 'N/A'
    });

    // Configure Cloudinary if not already configured
    configureCloudinary();

    let dataURI;

    // Determine resource type
    const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';

    // Handle different input types
    if (Buffer.isBuffer(fileInput)) {
      console.log('Converting buffer to base64');
      // Convert buffer to base64
      const b64 = fileInput.toString('base64');
      dataURI = `data:${mimeType};base64,${b64}`;
      console.log('DataURI created, length:', dataURI.length);
    } else if (typeof fileInput === 'string') {
      console.log('Input is string, checking if URL');
      // If it's already a path or URL, handle accordingly
      if (fileInput.startsWith('http')) {
        console.log('Input is URL, returning as is');
        // It's already a URL, return as is
        return {
          url: fileInput,
          public_id: fileName,
          format: mimeType.split('/')[1] || 'unknown',
          size: 0,
        };
      } else {
        console.log('Uploading from file path');
        // Assume it's a file path
        const result = await cloudinary.uploader.upload(fileInput, {
          folder: 'project-portal/messages',
          public_id: `${Date.now()}-${path.parse(fileName).name}`,
          resource_type: resourceType,
          access_mode: 'public',
        });
        console.log('Path upload successful');
        return {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          size: result.bytes,
        };
      }
    } else {
      console.error('Invalid file input type:', typeof fileInput);
      throw new Error('Invalid file input type');
    }

    console.log('Uploading dataURI to Cloudinary');
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'project-portal/messages',
      public_id: `${Date.now()}-${path.parse(fileName).name}`,
      resource_type: resourceType,
      access_mode: 'public',
    });

    console.log('DataURI upload successful');
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Upload avatar to Cloudinary
export const uploadAvatarToCloudinary = async (fileBuffer, folder = 'project-portal/avatars') => {
  try {
    // Configure Cloudinary if not already configured
    configureCloudinary();

    // Convert buffer to base64
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:image/jpeg;base64,${b64}`;

    // Upload to Cloudinary with optimized avatar transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      public_id: `avatar-${Date.now()}`,
      resource_type: 'image',
      transformation: [
        // Smart cropping with face detection
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        // Ensure consistent square output
        { width: 300, height: 300, crop: 'crop' },
        // High quality with auto format
        { quality: 'auto', format: 'auto' },
        // Slight sharpening for crisp display
        { effect: 'sharpen' }
      ]
    });

    return result;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw new Error('Failed to upload avatar to cloud storage');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;
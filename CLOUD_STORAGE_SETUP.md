# Cloud Storage Setup Guide

This project supports both local storage (for development) and cloud storage (for production) using Cloudinary.

## Local Development (Default)

For local development, files are stored in the `public/uploads` directory. This works automatically without any configuration.

## Production with Cloud Storage (Recommended)

For production deployment, it's recommended to use Cloudinary for file storage to ensure compatibility with hosting platforms like Vercel, Netlify, etc.

### Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Once logged in, go to your Dashboard
3. Note down your:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Deploy to Production

When you deploy to your hosting platform (Vercel, Netlify, etc.), make sure to add these environment variables in your hosting platform's settings.

#### For Vercel:
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add the three Cloudinary variables

#### For Netlify:
1. Go to your site dashboard
2. Navigate to Site settings → Environment variables
3. Add the three Cloudinary variables

## How It Works

The upload service automatically detects whether Cloudinary is configured:

- **If Cloudinary env vars are present**: Files are uploaded to Cloudinary
- **If Cloudinary env vars are missing**: Files are stored locally (localhost only)

This ensures:
- ✅ Development works out of the box
- ✅ Production works with proper cloud storage
- ✅ Seamless transition between environments

## File Management Features

### Upload
- Drag and drop or select PDF files
- Automatic file validation
- Support for both local and cloud storage

### Rename
- Click the edit icon on any file
- Enter a new name (extension will be added automatically)
- Changes are reflected immediately

### Delete
- Click the delete icon on any file
- Confirmation dialog prevents accidental deletion
- Files are permanently removed from storage

### View
- Click "View" to open files in the built-in PDF viewer
- Download files directly using the download button

## Storage Locations

### Local Storage
- Files stored in: `public/uploads/`
- URL format: `/uploads/filename.pdf`
- Good for: Development, testing

### Cloud Storage (Cloudinary)
- Files stored in: Cloudinary folder `diploma-study/`
- URL format: Cloudinary CDN URLs
- Good for: Production, live hosting

## Benefits of Cloud Storage

1. **Hosting Compatibility**: Works with all major hosting platforms
2. **Scalability**: No storage limits on your hosting plan
3. **Performance**: Global CDN for fast file delivery
4. **Reliability**: Professional file storage with backups
5. **Security**: Secure file URLs with optional access controls

## Troubleshooting

### Files not uploading in production?
- Check that Cloudinary environment variables are properly set
- Verify your Cloudinary credentials are correct
- Check hosting platform logs for error messages

### Files uploading but not displaying?
- Ensure your hosting platform supports the file API routes
- Check that CORS settings allow file access
- Verify file URLs are accessible

### Need to migrate from local to cloud?
- Set up Cloudinary environment variables
- Re-upload your files (they will automatically go to cloud storage)
- The system will handle the transition seamlessly

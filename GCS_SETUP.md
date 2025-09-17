# Google Cloud Storage Setup Guide

This guide will help you set up Google Cloud Storage for your Diploma Study Hub application.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud SDK installed locally
3. Cloud Run service already deployed

## Step 1: Create a Google Cloud Storage Bucket

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Storage** > **Buckets**
3. Click **Create Bucket**
4. Configure the bucket:
   - **Name**: `diplomastudy-files` (or your preferred name)
   - **Location**: Choose the same region as your Cloud Run service (e.g., `us-central1`)
   - **Storage class**: `Standard`
   - **Access control**: `Uniform`
   - **Protection tools**: Leave default settings

## Step 2: Configure Bucket Permissions

1. In your bucket, go to the **Permissions** tab
2. Click **Add Principal**
3. Add the following principals with the specified roles:
   - **Principal**: `allUsers`
   - **Role**: `Storage Object Viewer` (for public read access to uploaded files)
   - **Principal**: Your Cloud Run service account (e.g., `diplomastudy@your-project.iam.gserviceaccount.com`)
   - **Role**: `Storage Object Admin` (for upload, delete, and manage operations)

## Step 3: Update Environment Variables

Update your Cloud Run service with the required environment variables:

```bash
gcloud run services update diplomastudy \
  --region=us-central1 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=your-project-id,GCS_BUCKET_NAME=diplomastudy-files"
```

## Step 4: Service Account Permissions

Ensure your Cloud Run service has the necessary IAM roles:

1. Go to **IAM & Admin** > **IAM**
2. Find your Cloud Run service account
3. Add these roles if not already present:
   - `Storage Object Admin`
   - `Storage Legacy Bucket Reader`

## Step 5: Test the Setup

1. Deploy your updated application
2. Try uploading a PDF file
3. Check if the file appears in your GCS bucket
4. Verify that the PDF preview works correctly

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure the service account has proper IAM roles
2. **Bucket Not Found**: Verify the bucket name and project ID are correct
3. **Upload Fails**: Check Cloud Run logs for detailed error messages

### Useful Commands:

```bash
# List buckets
gsutil ls

# Check bucket permissions
gsutil iam get gs://diplomastudy-files

# View Cloud Run logs
gcloud logs read --service=diplomastudy --limit=50
```

## File Structure in GCS

Files will be stored with the following structure:
```
diplomastudy-files/
└── diploma-study/
    ├── 2024-01-15_10-30-45-123_math-notes.pdf
    ├── 2024-01-15_10-31-20-456_physics-formulas.pdf
    └── ...
```

## Security Notes

- Files are publicly readable via direct URLs
- Consider implementing authentication if you need private files
- Monitor storage usage and costs in the Google Cloud Console
- Set up lifecycle policies to manage old files if needed

## Cost Optimization

- Use appropriate storage classes based on access patterns
- Consider setting up lifecycle rules to move old files to cheaper storage classes
- Monitor usage through the Google Cloud Console billing section

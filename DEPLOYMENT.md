# Deployment Guide: Diploma Study Platform to Google Cloud

This guide will walk you through deploying your Next.js application to Google Cloud using Cloud Run with automated CI/CD through Cloud Build.

## Prerequisites

1. **Google Cloud Account**: Create a Google Cloud account if you don't have one
2. **Google Cloud Project**: Create a new project in Google Cloud Console
3. **Billing**: Enable billing for your project
4. **GitHub Repository**: Your code should be pushed to a GitHub repository

## Step 1: Set Up Google Cloud Project

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `diplomastudy-app` (or your preferred name)
4. Click "Create"

### 1.2 Enable Required APIs
Enable the following APIs in your project:
```bash
# Cloud Run API
# Cloud Build API
# Container Registry API
# Cloud Resource Manager API
```

You can enable these through the Console or using gcloud CLI:
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

## Step 2: Install Google Cloud CLI

### For macOS:
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### For Windows:
Download and install from: https://cloud.google.com/sdk/docs/install

### For Linux:
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

## Step 3: Configure gcloud CLI

```bash
# Login to your Google account
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Set default region (optional)
gcloud config set run/region us-central1
```

## Step 4: Set Up Cloud Build Trigger

### 4.1 Connect GitHub Repository
1. Go to Cloud Build → Triggers in Google Cloud Console
2. Click "Connect Repository"
3. Select "GitHub (Cloud Build GitHub App)"
4. Authenticate with GitHub
5. Select your repository: `your-username/diplomastudy`
6. Click "Connect"

### 4.2 Create Build Trigger
1. Click "Create Trigger"
2. Configure the trigger:
   - **Name**: `deploy-diplomastudy`
   - **Event**: Push to a branch
   - **Repository**: Select your connected repository
   - **Branch**: `^main$` (or `^master$` if using master branch)
   - **Configuration**: Cloud Build configuration file (yaml or json)
   - **Cloud Build configuration file location**: `cloudbuild.yaml`
3. Click "Create"

## Step 5: Update cloudbuild.yaml (if needed)

The `cloudbuild.yaml` file is already configured in your project. You may need to update the region if you prefer a different one:

```yaml
# In cloudbuild.yaml, update the region in the deploy step:
'--region', 'your-preferred-region'  # e.g., 'us-east1', 'europe-west1'
```

## Step 6: Environment Variables and Secrets

### 6.1 For Local Development
1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Update the values in `.env.local` for your local environment

### 6.2 For Production (Cloud Run)
Environment variables are set in the `cloudbuild.yaml` file. To add more:

```yaml
# In cloudbuild.yaml, add to the --set-env-vars parameter:
'--set-env-vars', 'NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,YOUR_VAR=value'
```

For sensitive data, use Google Secret Manager:
```bash
# Create a secret
gcloud secrets create database-url --data-file=-
# Enter your secret value and press Ctrl+D

# Update cloudbuild.yaml to use secrets:
'--set-secrets', 'DATABASE_URL=database-url:latest'
```

## Step 7: Deploy Your Application

### Option A: Automatic Deployment (Recommended)
1. Push your code to the main branch:
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

2. Cloud Build will automatically trigger and deploy your application
3. Monitor the build process in Cloud Build console
4. Once complete, you'll get a Cloud Run URL

### Option B: Manual Deployment
```bash
# Build and deploy manually
gcloud builds submit --config cloudbuild.yaml .
```

## Step 8: Configure Domain (Optional)

### 8.1 Custom Domain
1. Go to Cloud Run → your service → "Manage Custom Domains"
2. Click "Add Mapping"
3. Enter your domain name
4. Follow the DNS configuration instructions

### 8.2 SSL Certificate
Google Cloud automatically provides SSL certificates for custom domains.

## Step 9: Monitoring and Logging

### 9.1 View Logs
```bash
# View Cloud Run logs
gcloud logs read --service=diplomastudy --limit=50

# Or use the Console: Cloud Run → your service → Logs
```

### 9.2 Monitoring
- Go to Cloud Run → your service → Metrics
- Set up alerts for high CPU/memory usage
- Monitor request latency and error rates

## Step 10: File Upload Considerations

Your application handles file uploads to the local filesystem. For production:

### Option A: Use Cloud Storage (Recommended)
1. Create a Cloud Storage bucket
2. Update your upload API to use Cloud Storage
3. Configure proper permissions

### Option B: Persistent Disk (if needed)
Cloud Run is stateless, so uploaded files will be lost on container restart. Consider:
- Using Cloud Storage for file storage
- Implementing a database for file metadata

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Cloud Build logs
   - Ensure all dependencies are in package.json
   - Verify Dockerfile syntax

2. **Service Won't Start**:
   - Check Cloud Run logs
   - Verify PORT environment variable (should be 3000)
   - Check for missing environment variables

3. **File Uploads Don't Work**:
   - Files are stored in container's ephemeral storage
   - Consider using Cloud Storage for persistent file storage

4. **Permission Denied**:
   - Ensure Cloud Build service account has necessary permissions
   - Check IAM roles for Cloud Build and Cloud Run

### Useful Commands:
```bash
# Check service status
gcloud run services describe diplomastudy --region=us-central1

# View recent deployments
gcloud run revisions list --service=diplomastudy --region=us-central1

# Scale service
gcloud run services update diplomastudy --max-instances=20 --region=us-central1

# View build history
gcloud builds list --limit=10
```

## Cost Optimization

1. **Set appropriate resource limits**:
   - Memory: 1Gi (adjust based on usage)
   - CPU: 1 (can be reduced to 0.5 for lower traffic)

2. **Configure autoscaling**:
   - Min instances: 0 (to scale to zero when not in use)
   - Max instances: 10 (adjust based on expected traffic)

3. **Monitor usage**:
   - Use Cloud Monitoring to track resource usage
   - Set up budget alerts

## Security Best Practices

1. **Environment Variables**: Use Secret Manager for sensitive data
2. **IAM**: Follow principle of least privilege
3. **HTTPS**: Always use HTTPS (enabled by default on Cloud Run)
4. **Authentication**: Implement proper authentication for admin features
5. **File Upload Security**: Validate file types and sizes

## Next Steps

1. **Add Database**: Consider Cloud SQL or Firestore for data persistence
2. **Add Authentication**: Implement user authentication with Firebase Auth
3. **Add Monitoring**: Set up error tracking with Google Cloud Error Reporting
4. **Add CDN**: Use Cloud CDN for better performance
5. **Backup Strategy**: Implement regular backups for user data

Your application is now ready for production deployment on Google Cloud! 🚀

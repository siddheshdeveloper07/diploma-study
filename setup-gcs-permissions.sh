#!/bin/bash

# Setup script for Google Cloud Storage permissions
# This script sets up the necessary IAM roles and service account for Cloud Run

PROJECT_ID="diplomastudy-007"
SERVICE_NAME="diplomastudy"
BUCKET_NAME="diplomastudy-files"
REGION="europe-west1"

echo "Setting up Google Cloud Storage permissions for project: $PROJECT_ID"

# Set the project
gcloud config set project $PROJECT_ID

# Create service account if it doesn't exist
echo "Creating service account..."
gcloud iam service-accounts create $SERVICE_NAME \
    --display-name="Diploma Study Service Account" \
    --description="Service account for Diploma Study Cloud Run service" \
    --project=$PROJECT_ID || echo "Service account may already exist"

# Grant necessary IAM roles to the service account
echo "Granting IAM roles..."

# Storage Object Admin for managing files
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Storage Legacy Bucket Reader for bucket access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.legacyBucketReader"

# Create the GCS bucket if it doesn't exist
echo "Creating GCS bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME || echo "Bucket may already exist"

# Set bucket permissions for public read access to uploaded files
echo "Setting bucket permissions..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Create a folder structure in the bucket
echo "Creating folder structure..."
gsutil mkdir gs://$BUCKET_NAME/diploma-study

echo "Setup complete!"
echo "Service account: ${SERVICE_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "Bucket: gs://$BUCKET_NAME"
echo "You can now deploy your Cloud Run service."

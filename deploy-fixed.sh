#!/bin/bash

# Fixed deployment script for Diploma Study Hub
# This script deploys the application with proper GCS configuration

PROJECT_ID="diplomastudy-007"
SERVICE_NAME="diplomastudy"
BUCKET_NAME="diplomastudy-files"
REGION="europe-west1"

echo "Deploying Diploma Study Hub to Google Cloud Run..."

# Set the project
gcloud config set project $PROJECT_ID

# Build and push the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

echo "Pushing image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run with proper configuration
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --service-account $SERVICE_NAME@$PROJECT_ID.iam.gserviceaccount.com \
    --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=$BUCKET_NAME"

echo "Deployment complete!"
echo "Your service should be available at the URL shown above."

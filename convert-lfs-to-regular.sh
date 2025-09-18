#!/bin/bash

echo "Converting Git LFS files to regular files for Cloud Run compatibility..."

# Remove PDF files from LFS tracking
git lfs untrack "*.pdf"

# Remove the LFS files from git index
git rm --cached public/uploads/*.pdf

# Add them back as regular files
git add public/uploads/*.pdf

echo "Files converted! Now commit and push the changes."
echo "Run: git commit -m 'Convert PDF files from LFS to regular files for Cloud Run'"
echo "Then: git push origin main"

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_URL = 'https://diplomastudy-439005111855.europe-west1.run.app/api/upload';
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function uploadFile(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Uploaded: ${fileName}`);
      return true;
    } else {
      console.log(`❌ Failed to upload ${fileName}:`, result.error);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error uploading ${fileName}:`, error.message);
    return false;
  }
}

async function uploadAllFiles() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files to upload...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const file of pdfFiles) {
      const filePath = path.join(UPLOADS_DIR, file);
      const success = await uploadFile(filePath);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 Upload Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📁 Total files: ${pdfFiles.length}`);
    
  } catch (error) {
    console.error('Error reading uploads directory:', error);
  }
}

uploadAllFiles().catch(console.error);

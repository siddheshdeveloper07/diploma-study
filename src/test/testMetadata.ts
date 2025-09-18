import { FileMetadataService } from '../lib/fileMetadataService';

// Simple test script to verify metadata service is working
async function testMetadataService() {
  console.log('Testing FileMetadataService...');
  
  // Test 1: Update file folder
  console.log('Test 1: Updating file folder...');
  const success1 = await FileMetadataService.updateFileFolder('test-file-1', 'folder-123');
  console.log('Update result:', success1);
  
  // Test 2: Get file folder
  console.log('Test 2: Getting file folder...');
  const folder = await FileMetadataService.getFileFolder('test-file-1');
  console.log('File folder:', folder);
  
  // Test 3: Get all metadata
  console.log('Test 3: Getting all metadata...');
  const allMetadata = await FileMetadataService.getAllFileMetadata();
  console.log('All metadata:', allMetadata);
  
  // Test 4: Update another file
  console.log('Test 4: Updating another file...');
  const success2 = await FileMetadataService.updateFileFolder('test-file-2', 'folder-456');
  console.log('Update result:', success2);
  
  // Test 5: Get updated metadata
  console.log('Test 5: Getting updated metadata...');
  const updatedMetadata = await FileMetadataService.getAllFileMetadata();
  console.log('Updated metadata:', updatedMetadata);
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testMetadataService().catch(console.error);
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileItem, FolderItem, BreadcrumbItem } from "@/types/fileSystem";

export default function FileManager() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "My Drive" }]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggedItem, setDraggedItem] = useState<{id: string, type: 'file' | 'folder'} | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [itemToMove, setItemToMove] = useState<{id: string, name: string, type: 'file' | 'folder'} | null>(null);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showBulkMoveDialog, setShowBulkMoveDialog] = useState(false);

  async function refreshContent() {
    await Promise.all([refreshFiles(), refreshFolders(), loadAllFolders()]);
  }

  async function loadAllFolders() {
    try {
      const res = await fetch('/api/folders?parentId=all', { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAllFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error loading all folders:', error);
    }
  }

  async function refreshFiles() {
    try {
      const res = await fetch(`/api/files?folderId=${currentFolderId || ''}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load files");
        return;
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      setError("Failed to load files");
    }
  }

  async function refreshFolders() {
    try {
      const res = await fetch(`/api/folders?parentId=${currentFolderId || ''}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load folders");
        return;
      }
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (error) {
      setError("Failed to load folders");
    }
  }

  useEffect(() => {
    refreshContent();
  }, [currentFolderId]);

  async function onUpload(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (currentFolderId) {
      formData.append("folderId", currentFolderId);
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      await refreshFiles();
      if (inputRef.current) inputRef.current.value = "";
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) {
      setError("Please enter a folder name.");
      return;
    }

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), parentId: currentFolderId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create folder");
      }

      await refreshFolders();
      setShowCreateFolder(false);
      setNewFolderName("");
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Failed to create folder";
      setError(message);
    }
  }

  async function navigateToFolder(folderId: string | null, folderName: string) {
    setCurrentFolderId(folderId);
    
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: "My Drive" }]);
    } else {
      const newBreadcrumb = { id: folderId, name: folderName };
      setBreadcrumbs(prev => {
        const existingIndex = prev.findIndex(b => b.id === folderId);
        if (existingIndex >= 0) {
          return prev.slice(0, existingIndex + 1);
        }
        return [...prev, newBreadcrumb];
      });
    }
  }

  async function navigateToBreadcrumb(breadcrumbId: string | null) {
    const breadcrumbIndex = breadcrumbs.findIndex(b => b.id === breadcrumbId);
    if (breadcrumbIndex >= 0) {
      setCurrentFolderId(breadcrumbId);
      setBreadcrumbs(breadcrumbs.slice(0, breadcrumbIndex + 1));
    }
  }

  async function startEditing(id: string, currentName: string, type: 'file' | 'folder') {
    setEditingItem(id);
    if (type === 'file') {
      setEditingName(currentName.replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}_/, "").replace(".pdf", ""));
    } else {
      setEditingName(currentName);
    }
  }

  async function saveEdit() {
    if (!editingName.trim()) {
      setError("Please enter a valid name.");
      return;
    }

    try {
      const isFolder = folders.some(f => f.id === editingItem);
      const endpoint = isFolder ? "/api/folders" : "/api/files/actions";
      const body = isFolder 
        ? { folderId: editingItem, newName: editingName.trim() }
        : { fileId: editingItem, newName: editingName.trim() };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Rename failed");
      }

      await refreshContent();
      setEditingItem(null);
      setEditingName("");
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Rename failed";
      setError(message);
    }
  }

  async function deleteItem(id: string, name: string, type: 'file' | 'folder') {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const endpoint = type === 'folder' ? "/api/folders" : "/api/files/actions";
      const body = type === 'folder' 
        ? { folderId: id }
        : { fileId: id };

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }

      await refreshContent();
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Delete failed";
      setError(message);
    }
  }

  function handleDragStart(id: string, type: 'file' | 'folder') {
    setDraggedItem({ id, type });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDragEnter(folderId: string | null) {
    setDragOverFolder(folderId);
  }

  function handleDragLeave() {
    setDragOverFolder(null);
  }

  async function handleDrop(e: React.DragEvent, targetFolderId: string | null) {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    try {
      setError(null);
      console.log(`Drag & Drop: Moving ${draggedItem.type} "${draggedItem.id}" to folder:`, targetFolderId);
      
      const endpoint = draggedItem.type === 'folder' ? "/api/folders" : "/api/files/actions";
      const body = draggedItem.type === 'folder'
        ? { folderId: draggedItem.id, newParentId: targetFolderId }
        : { fileId: draggedItem.id, newFolderId: targetFolderId };

      const res = await fetch(endpoint, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Move failed");
      }

      console.log(`Successfully moved ${draggedItem.type} via drag & drop`);
      await refreshContent();
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Move failed";
      console.error('Drag & drop error:', message);
      setError(message);
    } finally {
      setDraggedItem(null);
      setDragOverFolder(null);
    }
  }

  function openMoveDialog(id: string, name: string, type: 'file' | 'folder') {
    setItemToMove({ id, name, type });
    setShowMoveDialog(true);
  }

  async function moveToFolder(targetFolderId: string | null) {
    if (!itemToMove) return;

    try {
      setError(null);
      console.log(`Moving ${itemToMove.type} "${itemToMove.name}" to folder:`, targetFolderId);
      
      const endpoint = itemToMove.type === 'folder' ? "/api/folders" : "/api/files/actions";
      const body = itemToMove.type === 'folder'
        ? { folderId: itemToMove.id, newParentId: targetFolderId }
        : { fileId: itemToMove.id, newFolderId: targetFolderId };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Move failed");
      }

      console.log(`Successfully moved ${itemToMove.type} "${itemToMove.name}"`);
      await refreshContent();
      setShowMoveDialog(false);
      setItemToMove(null);
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Move failed";
      console.error('Move error:', message);
      setError(message);
    }
  }

  // Multi-select functions
  function toggleFileSelection(fileId: string) {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  }

  function selectAllFiles() {
    setSelectedFiles(new Set(files.map(f => f.id)));
  }

  function clearSelection() {
    setSelectedFiles(new Set());
  }

  function openBulkMoveDialog() {
    if (selectedFiles.size === 0) return;
    setShowBulkMoveDialog(true);
  }

  async function bulkMoveToFolder(targetFolderId: string | null) {
    if (selectedFiles.size === 0) return;

    try {
      setError(null);
      
      // Move all selected files sequentially to avoid race conditions
      const selectedFilesArray = Array.from(selectedFiles);
      let failedCount = 0;
      
      for (const fileId of selectedFilesArray) {
        try {
          const res = await fetch("/api/files/actions", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId, newFolderId: targetFolderId }),
          });
          
          if (!res.ok) {
            failedCount++;
            console.error(`Failed to move file ${fileId}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error moving file ${fileId}:`, error);
        }
      }

      if (failedCount > 0) {
        setError(`Failed to move ${failedCount} out of ${selectedFiles.size} files`);
      }

      await refreshContent();
      setShowBulkMoveDialog(false);
      setSelectedFiles(new Set());
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Bulk move failed";
      setError(message);
    }
  }

  function cancelEdit() {
    setEditingItem(null);
    setEditingName("");
  }

  const totalItems = files.length + folders.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.id || 'root'} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => navigateToBreadcrumb(breadcrumb.id)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600 font-medium bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {breadcrumb.name}
              </button>
            </div>
          ))}
        </nav>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedFiles.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-700 hover:text-blue-900 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openBulkMoveDialog}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Move to Folder
              </button>
            </div>
          </div>
        )}

        {/* File Selection Controls */}
        {files.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllFiles}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Select all files ({files.length})
            </button>
            {selectedFiles.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear selection
              </button>
            )}
            {selectedFiles.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 p-6">
        <form onSubmit={onUpload} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload PDF
              </>
            )}
          </button>
        </form>
        
        {/* Move Instructions */}
        {files.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100/50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">📁 Organize your existing PDFs:</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• <strong>Drag & Drop:</strong> Drag files directly onto folders</li>
                  <li>• <strong>Move Button:</strong> Click the green move icon on any file</li>
                  <li>• <strong>Create Folders:</strong> Use "New Folder" to organize by subject</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-red-600 font-medium">Error</p>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-800 hover:text-red-900 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={createFolder}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`min-h-[400px] ${dragOverFolder === null && draggedItem ? 'ring-2 ring-dashed ring-blue-300 bg-blue-50/30 rounded-xl' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={() => handleDragEnter(null)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, currentFolderId)}
      >
        {totalItems === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">This folder is empty</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Create a new folder or upload a PDF to get started.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
          }>
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder.id} className={viewMode === 'grid' ? "group" : "group flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"}>
                {editingItem === folder.id ? (
                  <div className={viewMode === 'grid' ? "bg-white rounded-xl border border-gray-200 p-4 shadow-sm" : "flex-1"}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    draggable
                    onDragStart={() => handleDragStart(folder.id, 'folder')}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                    className={`${viewMode === 'grid' 
                      ? "bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      : "flex items-center flex-1 cursor-pointer"
                    } ${dragOverFolder === folder.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${draggedItem?.id === folder.id ? 'opacity-50' : ''}`}
                    onDoubleClick={() => navigateToFolder(folder.id, folder.name)}
                  >
                    <div className={viewMode === 'grid' ? "flex items-start gap-3" : "flex items-center gap-3 flex-1"}>
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${viewMode === 'grid' ? 'group-hover:scale-110 transition-transform duration-200' : ''}`}
                        style={{ backgroundColor: folder.color || '#3B82F6' }}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openMoveDialog(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Move folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                          title="Rename folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Delete folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {viewMode === 'list' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openMoveDialog(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Move folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                          title="Rename folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(folder.id, folder.name, 'folder');
                          }}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Delete folder"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div key={file.id} className={viewMode === 'grid' ? "group relative" : "group flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors relative"}>
                {editingItem === file.id ? (
                  <div className={viewMode === 'grid' ? "bg-white rounded-xl border border-gray-200 p-4 shadow-sm" : "flex-1"}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${viewMode === 'grid' 
                      ? "bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 w-full"
                      : "flex items-center flex-1"
                    } ${draggedItem?.id === file.id ? 'opacity-50' : ''} ${selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  >
                    {/* Multi-select checkbox */}
                    <div className={`absolute ${viewMode === 'grid' ? 'top-2 left-2' : 'left-3'} z-10`}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div
                      draggable
                      onDragStart={() => handleDragStart(file.id, 'file')}
                      className={`w-full ${viewMode === 'grid' ? 'cursor-pointer' : 'flex items-center gap-3 flex-1 cursor-pointer'}`}
                    >
                      <div className={viewMode === 'grid' ? "flex items-start gap-3 mb-3 ml-6" : "flex items-center gap-3 flex-1 ml-6"}>
                        <div className={`w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center ${viewMode === 'grid' ? 'group-hover:scale-110 transition-transform duration-200' : ''}`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {file.name.replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}_/, "").replace(/\.[^/.]+$/, "")}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={viewMode === 'grid' ? "flex gap-1 ml-6" : "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"}>
                        <Link
                          href={`/viewer/${encodeURIComponent(file.name)}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          title="View file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openMoveDialog(file.id, file.name, 'file')}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Move file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => startEditing(file.id, file.name, 'file')}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                          title="Rename file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <a
                          href={file.url}
                          download
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Download file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => deleteItem(file.id, file.name, 'file')}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Delete file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move to Folder Dialog */}
      {showMoveDialog && itemToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Move "{itemToMove.name}" to folder
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {/* Root folder option */}
              <button
                onClick={() => moveToFolder(null)}
                className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 flex items-center gap-3 group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">My Drive</div>
                  <div className="text-xs text-gray-500">Root folder</div>
                </div>
              </button>

              {/* Available folders */}
              {allFolders
                .filter(folder => folder.id !== itemToMove.id) // Don't allow moving into self
                .map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => moveToFolder(folder.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 flex items-center gap-3 group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: folder.color || '#3B82F6' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">{folder.name}</div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(folder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}

              {allFolders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                  </svg>
                  <p>No folders available</p>
                  <p className="text-xs">Create a folder first to organize your files</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowMoveDialog(false);
                  setItemToMove(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Move to Folder Dialog */}
      {showBulkMoveDialog && selectedFiles.size > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Move {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} to folder
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600 mb-2">Selected files:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Array.from(selectedFiles).map(fileId => {
                  const file = files.find(f => f.id === fileId);
                  return file ? (
                    <div key={fileId} className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="truncate">
                        {file.name.replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}_/, "").replace(/\.[^/.]+$/, "")}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {/* Root folder option */}
              <button
                onClick={() => bulkMoveToFolder(null)}
                className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 flex items-center gap-3 group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">My Drive</div>
                  <div className="text-xs text-gray-500">Root folder</div>
                </div>
              </button>

              {/* Available folders */}
              {allFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => bulkMoveToFolder(folder.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 flex items-center gap-3 group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: folder.color || '#3B82F6' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">{folder.name}</div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(folder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}

              {allFolders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h6l2 2h6a2 2 0 012 2v1" />
                  </svg>
                  <p>No folders available</p>
                  <p className="text-xs">Create a folder first to organize your files</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowBulkMoveDialog(false);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

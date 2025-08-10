
'use client';

import React, { useState, useRef, useEffect, useActionState, useTransition } from "react";
import Image from "next/image";
import { X, Camera, Loader2, Upload } from "lucide-react"; 
import { createPostServer } from "@/actions/createPostAction";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ImagePicker } from "./CameraCapture";

// Separate SubmitButton component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      
      className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap h-9" 
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin" /> 
      ) : (
        "Share Post" 
      )}
    </button>
  );
}

export default function CreatePostDialog({ open, onClose, defaultLocation = "" }) {
  const [caption, setCaption] = useState("");
  const [locationName, setLocationName] = useState(defaultLocation);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [isTransitioning, startTransition] = useTransition();

  const [state, formAction] = useActionState(createPostServer, { success: false, error: null });

  useEffect(() => {
    if (state.success) {
      toast.success("Post created successfully!");
      handleCloseDialog();
    } else if (state.error) {
      toast.error(state.error.message || "Failed to create post.");
    }
  }, [state]);

  const handleFilePicked = (file) => {
    setCapturedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowImagePicker(false);
  };

  const resetFormStates = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedFile(null);
    setCaption("");
    setLocationName(defaultLocation);
  };

  const handleCloseDialog = () => {
    resetFormStates();
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!capturedFile) {
      toast.error("Please select or take a photo before posting.");
      return;
    }
    if (!locationName) {
      toast.error("Please add a location.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (capturedFile && !formData.get('image')) {
        formData.append('image', capturedFile);
    }
    
    startTransition(() => {
      formAction(formData);
    });
  };

  if (!open) return null;

  return (
    <>
      {showImagePicker && (
        <ImagePicker
          open={showImagePicker}
          onFileSelected={handleFilePicked}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Share Your Journey</h3>
            <button
              onClick={handleCloseDialog}
              aria-label="Close"
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* left: preview */}
              <div className="space-y-3">
                <div className="relative w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden aspect-[4/3]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                      <Camera className="w-12 h-12 mb-3 text-purple-500" />
                      <p className="text-sm">No photo selected</p>
                      <p className="text-xs mt-1 text-gray-500">Choose an option below to add a photo.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white hover:bg-purple-50 cursor-pointer text-purple-600 h-9" 
                  >
                    <Camera className="w-5 h-5" /> Take Photo
                  </button>

                  <label
                    htmlFor="direct-upload-image"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white hover:bg-purple-50 cursor-pointer text-gray-600 h-9" 
                  >
                    <Upload className="w-5 h-5" /> Upload File
                    <input
                      id="direct-upload-image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFilePicked(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={resetFormStates}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 h-9" 
                  >
                    Clear Photo
                  </button>
                )}
              </div>

              {/* right: inputs */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    id="locationName"
                    name="locationName"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent px-3 py-2"
                    placeholder="e.g. Santorini, Greece"
                  />
                </div>

                <div>
                  <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <textarea
                    id="caption"
                    name="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent px-3 py-2 min-h-[120px]"
                    placeholder="Share something about this place..."
                  />
                </div>

                <div className="mt-auto flex justify-end items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50 h-9" 
                  >
                    Cancel
                  </button>
                  <SubmitButton />
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
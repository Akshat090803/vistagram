// src/components/CameraCapture.jsx (renamed to ImagePicker)
'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Check, Upload, Loader2, RotateCw, Camera as CameraIcon } from 'lucide-react'; // Renamed Camera to CameraIcon to avoid conflict
import Webcam from 'react-webcam'; // Import Webcam component

export const ImagePicker = ({ onFileSelected, onClose, open }) => {
  const webcamRef = useRef(null);
  const [capturedImageSrc, setCapturedImageSrc] = useState(null); // Stores base64 string for preview
  const [capturedFile, setCapturedFile] = useState(null); // Stores the actual File object
  const [isCameraReady, setIsCameraReady] = useState(false); // To know if webcam stream is active
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [cameraError, setCameraError] = useState(null); // To store camera access errors
  const [isCapturing, setIsCapturing] = useState(false); // New state to track if photo capture is in progress

  // Handler to capture photo from webcam
  const capturePhoto = useCallback(() => {
    setIsCapturing(true); // Start capturing process
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImageSrc(imageSrc);

        // Convert base64 string to Blob then to File object
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `vistagram-capture-${Date.now()}.jpeg`, { type: 'image/jpeg' });
            setCapturedFile(file);
            setIsCapturing(false); // End capturing process on success
          })
          .catch(error => {
            console.error("Error converting screenshot to file:", error);
            setCameraError("Failed to process image. Try again.");
            setIsCapturing(false); // End capturing process on error
          });
      } else {
        setIsCapturing(false); // End capturing if no imageSrc
      }
    } else {
      setIsCapturing(false); // End capturing if webcamRef is null
    }
  }, [webcamRef]);

  // Handler for uploading a file from the user's device
  const handleFileUpload = (event) => {
    setCameraError(null); // Clear previous errors
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImageSrc(reader.result); // Set base64 for preview
        setCapturedFile(file); // Store the actual file
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setCameraError('Only image files are allowed.');
    }
    event.target.value = null; // Clear input
  };

  // Function to confirm selection and pass file to parent
  const confirmSelection = () => {
    if (capturedFile) {
      onFileSelected(capturedFile);
      setCapturedImageSrc(null); // Clear preview
      setCapturedFile(null); // Clear file
      setCameraError(null); // Clear errors
      onClose(); // Close the picker
    }
  };

  // Function to reset the picker (retake/re-upload)
  const resetPicker = () => {
    setCapturedImageSrc(null);
    setCapturedFile(null);
    setCameraError(null); // Clear errors
  };

  // Toggle camera facing mode (front/back)
  const toggleFacingMode = useCallback(() => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
    setCameraError(null); // Clear errors when changing camera
    setIsCameraReady(false); // Indicate camera is re-initializing
  }, []);

  // Effect to handle camera errors (e.g., permissions)
  const handleUserMediaError = useCallback((error) => {
    console.error("Camera access error:", error);
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      setCameraError("Camera access denied. Please grant permission in your browser settings.");
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found on your device.");
    } else {
      setCameraError("Failed to access camera. Please ensure it's not in use by another app.");
    }
    setIsCameraReady(false);
  }, []);

  // Effect to clean up on close
  useEffect(() => {
    if (!open) {
      setCapturedImageSrc(null);
      setCapturedFile(null);
      setCameraError(null);
      setIsCameraReady(false);
      setIsCapturing(false); // Ensure capturing state is reset on close
    }
  }, [open]);

  // Check camera ready state
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  if (!open) return null;

  const videoConstraints = {
    facingMode: facingMode,
    width: 1280,
    height: 720,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[51] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col h-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Select an Image</h3>
          <button
            onClick={() => {
              setCapturedImageSrc(null);
              setCapturedFile(null);
              setCameraError(null);
              onClose();
            }}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content Area: Camera/Image Preview */}
        <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden h-96">
          {cameraError ? (
            <div className="text-white text-center p-4">
              <p className="mb-2 text-red-400">Error: {cameraError}</p>
              <p className="text-sm">Please try uploading a file instead or check camera permissions.</p>
            </div>
          ) : capturedImageSrc ? (
            <img
              src={capturedImageSrc}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-lg bg-gray-800">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <span>Activating Camera...</span>
                </div>
              )}
              <Webcam
                audio={false} // No audio needed
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className={`w-full h-full object-cover ${!isCameraReady ? 'hidden' : ''}`}
              />
            </>
          )}

          {/* Camera Controls Overlay */}
          {!capturedImageSrc && !cameraError && ( // Show controls only if no image is captured or error
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-5 bg-black/40 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
              {/* Upload Button */}
              <input
                id="file-upload-input" // Unique ID
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload-input" // Link label to input
                className="text-white p-2 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                aria-label="Upload Photo from Device"
              >
                <Upload className="w-6 h-6" />
              </label>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady || isCapturing} // Disable if camera stream not ready OR if already capturing
                className="bg-white text-gray-900 p-4 rounded-full hover:bg-gray-100 transition-colors shadow-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Capture Photo"
              >
                {isCapturing ? (
                  <Loader2 className="w-7 h-7 animate-spin" /> // Show spinner ONLY when capturing
                ) : (
                  <CameraIcon className="w-7 h-7" /> // Show camera icon when ready and not capturing
                )}
              </button>

              {/* Toggle Camera (Front/Back) */}
              {isCameraReady && !isCapturing && ( // Show toggle only if camera is active and not capturing
                <button
                  onClick={toggleFacingMode}
                  disabled={!isCameraReady || isCapturing} // Also disable toggle during capture
                  className="text-white p-2 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
                >
                  <RotateCw className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={capturedImageSrc ? resetPicker : onClose}
              className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
            >
              {capturedImageSrc ? 'Retake' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={confirmSelection}
              disabled={!capturedFile}
              className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Check className="w-5 h-5" /> Select Image
            </button>
        </div>
      </div>
    </div>
  );
};
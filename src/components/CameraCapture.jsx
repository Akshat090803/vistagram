
'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Check, Upload, Loader2, RotateCw } from 'lucide-react';

export const ImagePicker = ({ onFileSelected, onClose, open }) => {
  const [stream, setStream] = useState(null);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null); // Stores the blob URL for preview
  const [capturedFile, setCapturedFile] = useState(null); // Stores the actual File object to be returned
  const [isCameraActive, setIsCameraActive] = useState(false); // Indicates if camera stream is actively running
  const [cameraLoading, setCameraLoading] = useState(false); // Indicates if camera is currently trying to start
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to stop the camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Function to start the camera stream
  const startCamera = useCallback(async () => {
    setCameraLoading(true);
    // Stop any existing stream before starting a new one
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true); // Camera successfully started
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
      setIsCameraActive(false); // Camera could not start
      onClose(); // Automatically close the picker if camera access fails
    } finally {
      setCameraLoading(false); // Loading process finished
    }
  }, [facingMode, onClose, stopCamera]); // Added stopCamera to dependencies

  // Handler for capturing a photo from the video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `vistagram-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedImageBlob(URL.createObjectURL(blob));
            setCapturedFile(file);
            stopCamera(); // Stop camera after capture
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Handler for uploading a file from the user's device
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCapturedImageBlob(URL.createObjectURL(file));
      setCapturedFile(file);
      stopCamera(); // Stop camera if a file is uploaded
    } else if (file) {
      alert('Only image files are allowed.');
    }
    event.target.value = null; // Clear input to allow re-selection of the same file
  };

  // Function to confirm selection and pass file to parent
  const confirmSelection = () => {
    if (capturedFile) {
      onFileSelected(capturedFile);
      // Clean up blob URL immediately after passing the file
      if (capturedImageBlob) URL.revokeObjectURL(capturedImageBlob);
      setCapturedImageBlob(null);
      setCapturedFile(null);
      onClose(); // Close the picker modal
    }
  };

  // Function to reset the capture process (retake/re-upload)
  const resetPicker = () => {
    if (capturedImageBlob) URL.revokeObjectURL(capturedImageBlob);
    setCapturedImageBlob(null);
    setCapturedFile(null);
    startCamera(); // Restart camera for new capture
  };

  // Toggle camera facing mode (front/back)
  const toggleFacingMode = () => {
    setFacingMode(prevMode => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  // Effect to manage camera stream lifecycle
  useEffect(() => {
    if (open && !capturedFile) {
      // Start camera only if the picker is open and no image has been confirmed/selected yet
      startCamera();
    }
    // Cleanup function: runs on component unmount or when dependencies change
    return () => {
      stopCamera(); // Always stop camera when component is unmounted or `open` becomes false
      if (capturedImageBlob) URL.revokeObjectURL(capturedImageBlob); // Ensure blob URL is revoked
    };
  }, [open, startCamera, stopCamera, capturedFile, capturedImageBlob]); // Dependencies for effect

  if (!open) return null; // Don't render anything if `open` is false

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col h-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Select an Image</h3>
          <button
            onClick={() => {
              // Stop camera and clean up state before closing
              stopCamera();
              if (capturedImageBlob) URL.revokeObjectURL(capturedImageBlob);
              setCapturedImageBlob(null);
              setCapturedFile(null);
              onClose(); // Propagate close event to parent
            }}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content Area: Camera/Image Preview */}
        <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden h-96">
          {capturedImageBlob ? (
            <img
              src={capturedImageBlob}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              {cameraLoading ? (
                <div className="flex flex-col items-center text-white text-lg">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <span>Loading Camera...</span>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} // Flip for selfie mode
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </>
          )}

          {/* Camera Controls Overlay */}
          {!capturedImageBlob && ( // Show controls only if no image is captured yet
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-5 bg-black/40 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white p-2 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Upload Photo from Device"
              >
                <Upload className="w-6 h-6" />
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={!isCameraActive || cameraLoading} // Disable if camera not active OR loading
                className="bg-white text-gray-900 p-4 rounded-full hover:bg-gray-100 transition-colors shadow-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Capture Photo"
              >
                <Camera className="w-7 h-7" />
              </button>

              {/* Toggle Camera (Front/Back) */}
              {isCameraActive && ( // Show toggle only if camera is active
                <button
                  onClick={toggleFacingMode}
                  className="text-white p-2 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
                >
                  <RotateCw className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (at the bottom of the dialog) */}
        <div className="p-6 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={capturedImageBlob ? resetPicker : () => {
                // If no image is captured, this acts as a cancel button
                stopCamera();
                if (capturedImageBlob) URL.revokeObjectURL(capturedImageBlob);
                setCapturedImageBlob(null);
                setCapturedFile(null);
                onClose();
              }}
              className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
            >
              {capturedImageBlob ? 'Retake' : 'Cancel'}
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
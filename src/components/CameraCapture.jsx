'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Check, Upload, Loader2, RotateCw } from 'lucide-react'; // Added Loader2 and RotateCw for better feedback

export const CameraCapture = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // URL of the captured/uploaded image
  const [capturedFile, setCapturedFile] = useState(null); // File object of the captured/uploaded image
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false); // New state to manage camera active status
  const [cameraLoading, setCameraLoading] = useState(false); // To show loading state for camera
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to start the camera stream
  const startCamera = useCallback(async () => {
    setCameraLoading(true); // Indicate camera is starting
    try {
      // Stop any existing tracks before starting new ones
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode, // Use state for facing mode
          width: { ideal: 1280 }, // Optimize resolution for better performance
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
      setIsCameraActive(false); // Camera could not start
    } finally {
      setCameraLoading(false); // Camera loading finished
    }
  }, [facingMode]); // Dependency on facingMode

  // Function to stop the camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Handler for capturing a photo from the video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video to avoid stretching
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); // Draw video frame to canvas

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `vistagram-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob); // Create a URL for display
            setCapturedImage(imageUrl);
            setCapturedFile(file);
            stopCamera(); // Stop camera after capture
          }
        }, 'image/jpeg', 0.9); // Quality set to 0.9 for better image
      }
    }
  };

  // Handler for uploading a file from the user's device
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for display
      setCapturedImage(imageUrl);
      setCapturedFile(file);
      stopCamera(); // Stop camera if file is uploaded
    } else if (file && !file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
    }
    // Clear the input value so the same file can be selected again if needed
    event.target.value = null;
  };

  // Handler for submitting the post (uploading image and data)
  const handleSubmit = async () => {
    if (capturedFile && caption.trim() && location.trim()) {
      setIsUploading(true);
      try {
        await onCapture(capturedFile, caption, location);
        onClose(); // Close dialog on successful upload
      } catch (error) {
        console.error('Error uploading post:', error);
        alert('Failed to upload post. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Function to reset the capture process and restart camera
  const resetCapture = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setCaption('');
    setLocation('');
    startCamera(); // Restart camera
  };

  // Toggle camera facing mode (front/back)
  const toggleFacingMode = () => {
    setFacingMode(prevMode => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  // Start camera on component mount and stop on unmount
  useEffect(() => {
    if (!capturedImage) { // Only start camera if no image is captured
      startCamera();
    }
    return () => stopCamera();
  }, [startCamera, stopCamera, capturedImage]); // Re-run if startCamera or stopCamera changes, or if image state changes

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] font-sans">
        
        {/* Left Section: Camera/Image Preview */}
        <div className="relative flex-1 bg-gray-900 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured Vistagram"
              className="w-full h-full object-cover"
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
                    className="w-full h-full object-cover transform scaleX(-1)" // Flip for selfie mode feedback
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </>
          )}

          {/* Camera Controls Overlay */}
          {!capturedImage && (
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
                disabled={!isCameraActive}
                className="bg-white text-gray-900 p-4 rounded-full hover:bg-gray-100 transition-colors shadow-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Capture Photo"
              >
                <Camera className="w-7 h-7" />
              </button>

              {/* Toggle Camera (Front/Back) */}
              <button
                onClick={toggleFacingMode}
                className="text-white p-2 rounded-full hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Close Button on Image Section (Top Right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section: Form for Caption and Location */}
        {capturedImage && (
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
            {/* Form Fields */}
            <div className="space-y-6 flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Vistagram</h2>
              
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location 📍
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where did you capture this moment?"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 mb-2">
                  Caption ✍️
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your adventure..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={resetCapture}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RotateCw className="w-5 h-5" /> Retake
              </button>
              <button
                onClick={handleSubmit}
                disabled={!caption.trim() || !location.trim() || isUploading}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Share Post
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
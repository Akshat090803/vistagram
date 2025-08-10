// 'use client';

// import { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { ImagePlus, Loader2 } from 'lucide-react';
// import { useTransition } from 'react';

// import { toast } from 'sonner';
// import { createPostAction } from '@/actions/createPostAction';

// export default function CreatePostDialog({ open, onClose, user }) {
//   const [caption, setCaption] = useState('');
//   const [file, setFile] = useState(null);
//   const [isPending, startTransition] = useTransition();

//   const handleFileChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected && selected.type.startsWith('image/')) {
//       setFile(selected);
//     } else {
//       toast.error('Please select a valid image.');
//     }
//   };

//   const handleSubmit = () => {
//     if (!file) {
//       toast.error('Please upload an image');
//       return;
//     }

//     startTransition(async () => {
//       const formData = new FormData();
//       formData.append('caption', caption);
//       formData.append('file', file);
//       formData.append('userId', user.id);

//       const res = await createPostAction(formData);
//       if (res.success) {
//         toast.success('Post created!');
//         onClose();
//         setCaption('');
//         setFile(null);
//       } else {
//         toast.error(res.error || 'Failed to create post.');
//       }
//     });
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold">Share a New Post</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Upload Image
//           </label>
//           <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
//           {file && (
//             <div className="rounded-lg overflow-hidden border">
//               <img src={URL.createObjectURL(file)} alt="Preview" className="w-full object-cover" />
//             </div>
//           )}

//           <label className="block text-sm font-medium text-gray-700">
//             Caption
//           </label>
//           <Textarea
//             placeholder="Write something..."
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//           />
//         </div>

//         <DialogFooter className="mt-4 flex justify-end space-x-2">
//           <Button variant="outline" onClick={onClose}>Cancel</Button>
//           <Button onClick={handleSubmit} disabled={isPending}>
//             {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Post'}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// components/CreatePostDialog.jsx
'use client';

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { X, Camera } from "lucide-react";
import { createPostServer } from "@/actions/createPostAction";


export default function CreatePostDialog({ open, onClose, defaultLocation = "" }) {
  const [caption, setCaption] = useState("");
  const [locationName, setLocationName] = useState(defaultLocation);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [taking, setTaking] = useState(false); // when camera (native input) is used
  const [isPending, startTransition] = useTransition();

  const fileRef = useRef(null);

  // when user selects a file (upload or camera), show preview
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setPreviewUrl(URL.createObjectURL(f));
  };

  // clear/retake
  const handleRetake = () => {
    setPreviewUrl(null);
    setCaption("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // submit form via server action
  // We use a programmatic FormData + startTransition + fetch to call the server action.
  // However Next.js supports using <form action={createPostServer}> directly — to keep preview + better UX we call createPostServer via fetch to a form endpoint is more complex.
  // Instead we will use a <form action={createPostServer} method="post" encType="multipart/form-data"> and let Next handle it
  // but to show loading we will still use startTransition to submit the form programmatically.

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ensure there's a file selected
    const file = fileRef.current?.files?.[0];
    if (!file) {
      alert("Please select or take a photo.");
      return;
    }
    if (!locationName) {
      alert("Please enter a location.");
      return;
    }

    // Use FormData and call server action via fetch to the same route that Next uses internally:
    // NOTE: simpler and reliable approach: call a small API route that proxies to createPostServer, or directly use form action.
    // For compatibility and clarity we'll submit the form to the server action by creating a FormData and calling fetch to the current route with action header.
    // But Next's "form action={createPostServer}" works out-of-the-box in the app router, so we'll just submit the DOM form.

    const formEl = e.target;
    // Let Next handle the server action by using built-in form submit behavior.
    // But to keep the dialog open during processing and show spinner, use startTransition and call formEl.requestSubmit()

    startTransition(() => {
      formEl.requestSubmit();
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Share a post</h3>
          <button
            onClick={() => {
              // clear URL object to avoid memory leak
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              onClose();
            }}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        {/* IMPORTANT: action points to server action (createPostServer) and encType multipart/form-data */}
        <form
          action={createPostServer}
          method="post"
          encType="multipart/form-data"
          onSubmit={(e) => {
            // onSubmit will be called by the browser; handleSubmit intercepts to validate before native handling.
            // We intercept to validate then allow native submission to call the server action.
            if (!fileRef.current?.files?.[0]) {
              e.preventDefault();
              alert("Please attach a photo before posting.");
            }
            if (!locationName) {
              e.preventDefault();
              alert("Please add a location.");
            }
            // else allow normal submit (Next will call the server action) — no page reload with App Router
          }}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* left: preview */}
            <div className="space-y-3">
              <div className="relative w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden aspect-[4/3]">
                {previewUrl ? (
                  // use next/image if you prefer but for blob preview native img is fine
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                    <Camera className="w-12 h-12 mb-3 text-purple-500" />
                    <p className="text-sm">No photo selected</p>
                    <p className="text-xs mt-1 text-gray-500">Tap Take Photo to use your camera</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <label
                  htmlFor="image"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white hover:bg-purple-50 cursor-pointer text-purple-600"
                >
                  Take / Upload
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileRef}
                    onChange={(e) => onFileChange(e)}
                    className="hidden"
                  />
                </label>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      // clear preview and file input
                      handleRetake();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50"
                  >
                    Retake
                  </button>
                )}
              </div>
            </div>

            {/* right: inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent px-3 py-2"
                  placeholder="e.g. Santorini, Greece"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
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
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  {isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

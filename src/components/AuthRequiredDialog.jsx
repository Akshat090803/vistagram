'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Plane, ArrowRight } from 'lucide-react';

export default function AuthRequiredDialog({ open, onClose }) {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    let timerId;
    if (open) {
      setCountdown(10);
      timerId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            onClose(); // Immediately start closing the dialog
            // Defer navigation to the next event loop tick to avoid render conflicts
            setTimeout(() => {
              router.push('/sign-in');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [open, router, onClose]);

  const handleGoToSignIn = () => {
    onClose(); // Close dialog first
    // Defer navigation for consistency and to avoid render conflicts
    setTimeout(() => {
      router.push('/sign-in');
    }, 0);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
       
        className="w-full  bg-card text-card-foreground rounded-xl shadow-lg p-6 border border-gray-200 animate-in fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        <DialogHeader className="flex flex-col items-center text-center gap-3 mb-4">
         
          <div className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Globe className="w-9 h-9 text-primary-foreground animate-spin-slow" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
            Authentication Required!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm mt-1 text-center">
            To share your adventures and connect with fellow explorers, you must be signed in.
          </DialogDescription>
        </DialogHeader>

       
        <div className="text-center my-5 p-3 bg-purple-50 rounded-md">
          <p className="text-lg font-semibold text-purple-700 flex items-center justify-center gap-2">
            <Plane className="w-5 h-5 text-purple-600 animate-bounce-horizontal" />
            Redirecting in {countdown}s...
          </p>
        </div>

       
        <DialogFooter
        
          className="flex flex-col-reverse sm:flex-row justify-center  gap-3 mt-4 mx-auto"
        >
          <Button
            variant="outline"
            onClick={onClose}
            
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors py-2 text-sm whitespace-nowrap cursor-pointer"
          >
            Stay & Explore Anonymously
          </Button>
          <Button
            onClick={handleGoToSignIn}
           
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold transition-colors py-2 text-sm flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer headerBtnHover"
          >
            Go to Sign In Now <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
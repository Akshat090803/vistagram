
'use client';

import React, { useEffect, useActionState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, Compass, PlaneTakeoff, Luggage } from 'lucide-react'; 
import { signOutHandler } from '@/actions/authentication';
import { toast } from 'sonner';

export default function UserProfileDialog({ open, onClose, user }) {
  const [logoutState, formLogoutAction] = useActionState(signOutHandler, { success: false, error: null });

  useEffect(() => {
    if (logoutState.success) {
      toast.success("We'll miss you, explorer! Safe travels!");
    } else if (logoutState.error) {
      toast.error(logoutState.error.message || "Failed to log out. Please try again.");
    }
  }, [logoutState]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs bg-gradient-to-br from-white to-purple-50 text-card-foreground rounded-2xl shadow-xl p-7 border border-purple-200">
        <DialogHeader className="flex flex-col items-center text-center gap-3 mb-5">
          {/* Main User/Travel Icon */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg border-2 border-white">
            <PlaneTakeoff className="w-10 h-10 text-primary-foreground animate-pulse-subtle" /> {/* Animated travel icon */}
          </div>
          
         
          <DialogTitle className="text-2xl font-extrabold text-gray-900 leading-tight">
            Hello, Captain!
          </DialogTitle>
          <DialogDescription className="text-gray-700 text-sm italic">
            Your Vistagram journey awaits.
          </DialogDescription>
        </DialogHeader>

       
        <div className="text-center my-4 py-3 px-2 bg-purple-100 rounded-lg border border-purple-300 shadow-inner">
          <p className="text-base text-purple-800 font-semibold flex items-center justify-center gap-2">
            <Luggage className="w-5 h-5 text-purple-600" />
            Until next time, keep exploring!
          </p>
        </div>

        <DialogFooter className="mt-6 flex justify-center">
          <form action={formLogoutAction} className="w-full">
            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transform transition-transform duration-200 hover:scale-105 shadow-md"
            >
              <LogOut className="w-4 h-4" /> End Expedition
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
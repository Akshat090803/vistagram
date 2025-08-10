'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, UserCircle } from 'lucide-react';
import CreatePostDialog from '@/components/CreatePostDialog';
import AuthRequiredDialog from '@/components/AuthRequiredDialog';
import UserProfileDialog from '@/components/UserProfileDialog';
import { usePathname } from 'next/navigation'; 

export default function HeaderClient({ user }) {
  const pathname = usePathname();

  const hideButtonsRoutes = ['/login', '/sign-up'];

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] = useState(false);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);

  const handleUploadClick = () => {
    if (!user) {
      setIsAuthRequiredDialogOpen(true);
    } else {
      setIsUploadDialogOpen(true);
    }
  };

  const handleUserProfileClick = () => {
    if (user) {
      setIsUserProfileDialogOpen(true);
    } else {
      window.location.href = '/login';
    }
  };

  // Conditional rendering: If current path is in hideButtonsRoutes, display a travel thought.
  if (hideButtonsRoutes.includes(pathname)) {
    return (
      <div className="flex items-center text-gray-500 italic">
        {/* Longer text for medium and larger screens */}
        <span className="hidden md:block text-sm font-medium">
          "The world is a book, and those who do not travel read only one page."
        </span>
        {/* Shorter text for small screens */}
        <span className="block md:hidden text-xs font-medium px-2"> 
          "Explore. Dream. Discover."
        </span>
      </div>
    );
  }


  return (
    <>
      <CreatePostDialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} user={user} />
      <AuthRequiredDialog open={isAuthRequiredDialogOpen} onClose={() => setIsAuthRequiredDialogOpen(false)} />
      <UserProfileDialog open={isUserProfileDialogOpen} onClose={() => setIsUserProfileDialogOpen(false)} user={user} />

      <div className="flex items-center space-x-4">
        <button
          onClick={handleUploadClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all cursor-pointer"
        >
          <Camera className="h-5 w-5 mr-0 lg:mr-2" />
          <span className="hidden lg:block">Share</span>
        </button>

        {user ? (
          <button onClick={handleUserProfileClick} className="p-0 border-none bg-transparent cursor-pointer">
            <UserCircle className="h-8 w-8 text-gray-600 hover:text-purple-600" />
          </button>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign In
          </Link>
        )}
      </div>
    </>
  );
}
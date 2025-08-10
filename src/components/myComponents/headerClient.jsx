// // 'use client'

// // import { Camera, Compass } from "lucide-react"
// // import { useState } from "react"

// // export default  function HeaderClient ({user}){
// //       const [showCamera, setShowCamera] = useState(false);
// //   return (
// //     <>
// //       <header className="bg-white shadow-sm fixed top-0 z-40 w-full">
// //         <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <Compass className="w-8 h-8 text-primary" />
// //             <h1 className="text-2xl font-bold text-gray-900">
// //               Vistagram
// //             </h1>
// //           </div>
//           // <button
//           //   onClick={() => setShowCamera(true)}
//           //   className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-hover transition-colors flex items-center gap-2 font-medium headerBtnHover cursor-pointer"
//           // >
//           //   <Camera className="w-4 h-4" />
//           //   Share
//           // </button>
// //         </div>
// //       </header>
      
// //     </>
// //   )
// // }

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { Camera, UserCircle, Upload } from 'lucide-react';

// export default function HeaderClient({ user }) {
//   const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

//   const handleUploadClick = () => {
//     if (!user) {
//       // If no user, you would typically use a router to navigate
//       // For simplicity, we'll use an alert here.
//       alert("Please sign in to share a post.");
//       // In a real app: router.push('/login');
//     } else {
//       setIsUploadDialogOpen(true);
//     }
//   };

//   return (
//     <>
//       {/* {isUploadDialogOpen && <CreatePostDialog onClose={() => setIsUploadDialogOpen(false)} />} */}

//       <div className="flex items-center space-x-4">
//         <button
//           onClick={handleUploadClick}
//           className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all headerBtnHover cursor-pointer"
//         >
//           <Camera className="h-5 w-5 mr-0 lg:mr-2 " />
//            <span className=" hidden lg:block">Share</span>
//         </button>

//         {user ? (
//           <Link href="/profile">
//             <UserCircle className="h-8 w-8 text-gray-600 hover:text-purple-600" />
//           </Link>
//         ) : (
//           <Link href="/sign-in" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
//             Sign In
//           </Link>
//         )}
//       </div>
//     </>
//   );
// }


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, UserCircle } from 'lucide-react';
import CreatePostDialog from '@/components/CreatePostDialog';

export default function HeaderClient({ user }) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleUploadClick = () => {
    if (!user) {
      alert("Please sign in to share a post.");
    } else {
      setIsUploadDialogOpen(true);
    }
  };

  return (
    <>
      <CreatePostDialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} user={user} />

      <div className="flex items-center space-x-4">
        <button
          onClick={handleUploadClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all"
        >
          <Camera className="h-5 w-5 mr-0 lg:mr-2" />
          <span className="hidden lg:block">Share</span>
        </button>

        {user ? (
          <Link href="/profile">
            <UserCircle className="h-8 w-8 text-gray-600 hover:text-purple-600" />
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign In
          </Link>
        )}
      </div>
    </>
  );
}

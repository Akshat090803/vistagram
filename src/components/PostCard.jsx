// 'use client'
// import { useState, useRef, useEffect, useActionState, useTransition } from 'react';
// import { Heart, Share, MapPin, Loader2, Check } from 'lucide-react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { likePostAction, sharePostAction } from '@/actions/postActions';
// import { toast } from 'sonner';
// import AuthRequiredDialog from './AuthRequiredDialog';

// export default function PostCard({ post }) {
//   // Initialize states with post props. These will be updated by useEffect on prop changes.
//   const [isLiked, setIsLiked] = useState(post.isLiked);
//   const [currentLikes, setCurrentLikes] = useState(post.likes);
//   const [currentShares, setCurrentShares] = useState(post.shares);
//   const [isSharing, setIsSharing] = useState(false);
//   const [copyStatus, setCopyStatus] = useState('');
//   const [postUrl, setPostUrl] = useState('');
//   const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] = useState(false);
//   const [displayTimestamp, setDisplayTimestamp] = useState(new Date(post.createdAt).toISOString());
//   const [isLikingLoading, setIsLikingLoading] = useState(false); 

//   const shareLinkRef = useRef(null);
//   const [isPending, startTransition] = useTransition(); 

//   // Server actions
//   const [likeState, formLikeAction] = useActionState(likePostAction, { success: false, error: null, liked: null });
//   const [shareState, formShareAction] = useActionState(sharePostAction, { success: false, error: null });


//   // This useEffect ensures that local state (isLiked, currentLikes)
//   // is always in sync with the 'post' prop after re-renders (e.g., due to revalidatePath).
//   useEffect(() => {
//     setIsLiked(post.isLiked);
//     setCurrentLikes(post.likes);
//     setCurrentShares(post.shares); // Also sync shares on prop update
//     if (typeof window !== 'undefined') {
//       setPostUrl(`${window.location.origin}/post/${post.id}`);
//       setDisplayTimestamp(formatTimestamp(post.createdAt));
//     }
//   }, [post]); 

//   useEffect(() => {
//     if (copyStatus === 'copied') {
//       const timer = setTimeout(() => setCopyStatus(''), 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [copyStatus]);

//   useEffect(() => {
//     if (likeState.success === true) {
   
//       setIsLiked(likeState.liked);
     
//       toast.success(likeState.liked ? 'Post liked!' : 'Post unliked!');
//     } else if (likeState.success === false && likeState.error) {
     
//       if (likeState.error.message === 'Authentication required to like posts.') {
//         setIsAuthRequiredDialogOpen(true);
//       } else {
//         toast.error(likeState.error.message);
//       }
//     }
//     setIsLikingLoading(false); 
//   }, [likeState]);

//   // Handle response from sharePostAction
//   useEffect(() => {
//     if (shareState.success) {
//       // No need to manually increment here, as 'post' prop will update from revalidatePath
//       toast.success('Post shared!');
//     } else if (shareState.error) {
//       toast.error(shareState.error.message);
//     }
//   }, [shareState]);

//   // Handle Like/Unlike action
//   const handleLike = () => {
//     setIsLikingLoading(true); // Start loading immediately
    
//     startTransition(async () => {
//       formLikeAction(post.id);
//     });
//   };

//   // Handle Share action
//   const handleShare = async () => {
//     setIsSharing(true);
//     setCopyStatus('copying');
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: `Discover ${post.location.name} on Vistagram!`,
//           text: post.caption,
//           url: postUrl,
//         });
//         startTransition(() => {
//             formShareAction(post.id);
//         });
//         setCopyStatus('');
//       } else {
//         if (shareLinkRef.current) {
//           await navigator.clipboard.writeText(postUrl);
//           startTransition(() => {
//             formShareAction(post.id);
//           });
//           setCopyStatus('copied');
//         } else {
//             console.warn('shareLinkRef.current is null, cannot copy to clipboard.');
//             toast.error('Failed to copy link. Element not available.');
//         }
//       }
//     } catch (error) {
//       console.error('Share cancelled or failed:', error);
//       setCopyStatus('');
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
//     const diffInMinutes = Math.floor(diffInSeconds / 60);
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     const diffInDays = Math.floor(diffInHours / 24);
//     if (diffInDays < 7) return `${diffInDays}d ago`;
    
//     const diffInWeeks = Math.floor(diffInDays / 7);
//     if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   return (
//     <>
//       <AuthRequiredDialog open={isAuthRequiredDialogOpen} onClose={() => setIsAuthRequiredDialogOpen(false)} />

//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 max-w-4xl min-w-full mx-auto transform transition-all duration-300 hover:shadow-xl relative group font-sans">
//         <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
          
//           {/* Image Section (Left Half on Desktop, Top Half on Mobile) */}
//           <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
//             <Image
//               src={post.imageUrl}
//               alt={post.location.name}
//               layout="fill"
//               objectFit="cover"
//               className="transition-transform duration-500 hover:scale-105"
//               priority
//             />
           
//             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
//           </div>
          
//           {/* Content Section (Right Half on Desktop, Bottom Half on Mobile) */}
//           <div className="w-full md:w-1/2 p-6 flex flex-col justify-between relative bg-white rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none">
            
//             {/* Post Header (Location & Explore Link with Like Stamp) */}
//             <div className="mb-4 relative flex justify-between items-start">
//               <div> {/* Wrapper for location and explore link */}
//                 <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight">
//                   {post.location.name}
//                 </h2>
//                 <Link
//                   href="https://www.headout.com"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center gap-1.5 text-primary hover:text-purple-700 transition-colors duration-200 font-medium group"
//                 >
//                   <MapPin className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-transform group-hover:scale-110" />
//                   <span>Explore experiences here</span>
//                 </Link>
//               </div>

            
//               <button
//                 onClick={handleLike}
//                 disabled={isLikingLoading} 
//                 className={`relative w-12 h-12 rounded-sm border-2 border-dashed flex-shrink-0
//                   transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
//                   ${isLiked && !isLikingLoading // Apply liked style only if liked and not currently loading
//                     ? 'bg-primary border-primary text-primary-foreground' // Changed to primary theme
//                     : 'bg-white border-gray-300 text-gray-400 hover:border-primary hover:text-primary' // Changed hover to primary theme
//                   }`}
//                 style={{
//                   clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
//                 }}
//                 aria-label="Like Post"
//               >
//                 {isLikingLoading ? (
//                   <Loader2 className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-gray-600" />
//                 ) : (
//                   <Heart
//                     className={`w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
//                       ${isLiked ? 'fill-current scale-110 animate-pop' : 'hover:scale-110'}`}
//                   />
//                 )}
//               </button>
//             </div>
            
//             {/* Post Caption */}
//             <div className="flex-1 overflow-hidden pr-2 mb-6">
//               <p className="text-gray-700 text-base leading-relaxed">
//                 {post.caption}
//               </p>
//             </div>
            
//             {/* Footer (Author, Timestamp, Likes, Shares) */}
//             <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-100 gap-3 sm:gap-0">
//               <div className="text-sm text-gray-500 order-2 sm:order-1">
//                 <span className="font-semibold text-gray-800">@{post.author.username}</span> • <time dateTime={new Date(post.createdAt).toISOString()}>{displayTimestamp}</time>
//               </div>
              
//               <div className="flex items-center gap-4 order-1 sm:order-2">
               
//                 <div className="flex items-center gap-1 text-base text-gray-600 font-semibold">
//                   <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-gray-400'}`}  /> 
//                   <span>{currentLikes.toLocaleString()}</span>
//                 </div>
                
               
//                 <button
//                   onClick={handleShare}
//                   disabled={isSharing}
//                   className="flex items-center gap-1 text-base text-gray-600 hover:text-green-600 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
//                   aria-label="Share Post"
//                 >
//                   {copyStatus === 'copying' ? (
//                     <Loader2 className="w-5 h-5 animate-spin text-green-500" />
//                   ) : copyStatus === 'copied' ? (
//                     <Check className="w-5 h-5 text-green-500" />
//                   ) : (
//                     <Share className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
//                   )}
//                   <span className="font-semibold">{currentShares}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         {postUrl && (
//             <input
//             type="text"
//             ref={shareLinkRef}
//             readOnly
//             className="absolute -left-full top-0"
//             value={postUrl}
//             />
//         )}
//       </div>
//     </>
//   );
// }

// src/components/PostCard.jsx
'use client'
import { useState, useRef, useEffect, useActionState, useTransition } from 'react';
import { Heart, Share, MapPin, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { likePostAction, sharePostAction } from '@/actions/postActions';
import { toast } from 'sonner';
import AuthRequiredDialog from './AuthRequiredDialog';

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [currentLikes, setCurrentLikes] = useState(post.likes);
  const [currentShares, setCurrentShares] = useState(post.shares);
  const [isSharing, setIsSharing] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [isAuthRequiredDialogOpen, setIsAuthRequiredDialogOpen] = useState(false);
  const [displayTimestamp, setDisplayTimestamp] = useState(new Date(post.createdAt).toISOString());
  const [isLikingLoading, setIsLikingLoading] = useState(false);

  const shareLinkRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  const [likeState, formLikeAction] = useActionState(likePostAction, { success: false, error: null, liked: null });
  const [shareState, formShareAction] = useActionState(sharePostAction, { success: false, error: null });

  useEffect(() => {
    setIsLiked(post.isLiked);
    setCurrentLikes(post.likes);
    setCurrentShares(post.shares);
    if (typeof window !== 'undefined') {
      setPostUrl(`${window.location.origin}/post/${post.id}`);
      setDisplayTimestamp(formatTimestamp(post.createdAt));
    }
  }, [post]);

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  useEffect(() => {
    if (likeState.success === true) {
      toast.success(likeState.liked ? 'Post liked!' : 'Post unliked!');
    } else if (likeState.success === false && likeState.error) {
      if (likeState.error.message === 'Authentication required to like posts.') {
        setIsAuthRequiredDialogOpen(true);
      } else {
        toast.error(likeState.error.message);
      }
    }
    setIsLikingLoading(false);
  }, [likeState]);

  useEffect(() => {
    if (shareState.success) {
      toast.success('Post shared!');
    } else if (shareState.error) {
      toast.error(shareState.error.message);
    }
  }, [shareState]);

  const handleLike = () => {
    setIsLikingLoading(true);
    startTransition(async () => {
      formLikeAction(post.id);
    });
  };

  const handleShare = async () => {
    setIsSharing(true);
    setCopyStatus('copying');
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Discover ${post.location.name} on Vistagram!`,
          text: post.caption,
          url: postUrl,
        });
        startTransition(() => {
            formShareAction(post.id);
        });
        setCopyStatus('');
      } else {
        if (shareLinkRef.current) {
          await navigator.clipboard.writeText(postUrl);
          startTransition(() => {
            formShareAction(post.id);
          });
          setCopyStatus('copied');
        } else {
            console.warn('shareLinkRef.current is null, cannot copy to clipboard.');
            toast.error('Failed to copy link. Element not available.');
        }
      }
    } catch (error) {
      console.error('Share cancelled or failed:', error);
      setCopyStatus('');
    } finally {
      setIsSharing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <AuthRequiredDialog open={isAuthRequiredDialogOpen} onClose={() => setIsAuthRequiredDialogOpen(false)} />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 max-w-4xl mx-auto transform transition-all duration-300 hover:shadow-xl relative group font-sans">
        <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
          
          {/* Image Section (Left Half on Desktop, Top Half on Mobile) */}
          <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
            <Image
              src={post.imageUrl}
              alt={post.location.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 hover:scale-105"
              priority
            />
           
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
          
          {/* Content Section (Right Half on Desktop, Bottom Half on Mobile) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between relative bg-white rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none">
            
            {/* Post Header (Location & Explore Link with Like Stamp) */}
            <div className="mb-4 relative flex justify-between items-start">
              <div> {/* Wrapper for location and explore link */}
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight">
                  {post.location.name}
                </h2>
                <Link
                  href="https://www.headout.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:text-purple-700 transition-colors duration-200 font-medium group"
                >
                  <MapPin className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-transform group-hover:scale-110" />
                  <span>Explore experiences here</span>
                </Link>
              </div>

              {/* Like Stamp: Placed within the header, near location */}
              <button
                onClick={handleLike}
                disabled={isLikingLoading}
                className={`relative w-12 h-12 rounded-sm border-2 border-dashed flex-shrink-0
                  transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isLiked && !isLikingLoading
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                  }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
                aria-label="Like Post"
              >
                {isLikingLoading ? (
                  <Loader2 className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-gray-600" />
                ) : (
                  <Heart
                    className={`w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                      ${isLiked ? 'fill-current scale-110 animate-pop' : 'hover:scale-110'}`}
                  />
                )}
              </button>
            </div>
            
            {/* Post Caption */}
            <div className="flex-1 overflow-hidden pr-2 mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                {post.caption}
              </p>
            </div>
            
            {/* Footer (Author, Timestamp, Likes, Shares) */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-100 gap-3 sm:gap-0">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                <span className="font-semibold text-gray-800">@{post.author.username}</span> • <time dateTime={new Date(post.createdAt).toISOString()}>{displayTimestamp}</time>
              </div>
              
              <div className="flex items-center gap-4 order-1 sm:order-2">
                {/* Likes count: Now a clickable button */}
                <button
                  onClick={handleLike} 
                  disabled={isLikingLoading} 
                  className="flex items-center gap-1 text-base text-gray-600 hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group" 
                >
                  
                  {
                    !isLikingLoading ? <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-gray-400'}`} /> : <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  }
                  
                  <span>{currentLikes.toLocaleString()}</span>
                </button>
                
                {/* Share Button with dynamic feedback */}
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center gap-1 text-base text-gray-600 hover:text-green-600 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                  aria-label="Share Post"
                >
                  {copyStatus === 'copying' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  ) : copyStatus === 'copied' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Share className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  )}
                  <span className="font-semibold">{currentShares}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {postUrl && (
            <input
            type="text"
            ref={shareLinkRef}
            readOnly
            className="absolute -left-full top-0"
            value={postUrl}
            />
        )}
      </div>
    </>
  );
}
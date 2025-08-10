

'use client'
import { useState, useRef, useEffect } from 'react';
import { Heart, Share, MapPin, Loader2, Check } from 'lucide-react'; // Removed LinkIcon, MoreHorizontal
import Image from 'next/image'; // For optimized images

export default function PostCard({ post, onLike, onShare }) {
  // State for like and share functionality
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(post.likes);
  const [currentShares, setCurrentShares] = useState(post.shares);
  const [isSharing, setIsSharing] = useState(false);
  const [copyStatus, setCopyStatus] = useState(''); // 'copying', 'copied', ''

  // Ref for the hidden input to facilitate clipboard copy
  const shareLinkRef = useRef(null);

  // Effect to clear "copied" status after a delay
  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  // Handler for liking/unliking a post
  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setCurrentLikes(prev => (newLikedState ? prev + 1 : prev - 1));
    if (onLike) onLike(post.id, newLikedState);
  };

  // Handler for sharing a post (Web Share API or clipboard fallback)
  const handleShare = async () => {
    setIsSharing(true);
    setCopyStatus('copying');
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`; // Construct actual post URL

      if (navigator.share) {
        // Use Web Share API if available for native sharing
        await navigator.share({
          title: `Discover ${post.location.name} on Vistagram!`,
          text: post.caption,
          url: postUrl,
        });
        setCurrentShares(prev => prev + 1);
        if (onShare) onShare(post.id);
        setCopyStatus(''); // Clear status on successful native share
      } else {
        // Fallback to clipboard copy if Web Share API is not supported
        if (shareLinkRef.current) {
          await navigator.clipboard.writeText(postUrl);
          setCurrentShares(prev => prev + 1);
          if (onShare) onShare(post.id);
          setCopyStatus('copied'); // Indicate successful copy
        }
      }
    } catch (error) {
      console.error('Share cancelled or failed:', error);
      setCopyStatus(''); // Clear status on cancellation or failure
    } finally {
      setIsSharing(false);
    }
  };

  // Function to format timestamp to a human-readable "X [unit] ago" format
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
    
    // For older posts, show relative week or full date
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 max-w-4xl mx-auto transform transition-all duration-300 hover:shadow-xl relative group font-sans">
      {/* Container for horizontal split on desktop, vertical on mobile */}
      <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
        
        {/* Image Section (Left Half on Desktop, Top Half on Mobile) */}
        <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.location.name}
            layout="fill" // Ensures image fills container
            objectFit="cover" // Crops image to cover container
            className="transition-transform duration-500 hover:scale-105" // Subtle zoom on hover
            priority // Prioritize loading for initial view
          />
          {/* Subtle gradient overlay on image for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Postage Stamp Like Button (Top Right of Image) */}
          <button
            onClick={handleLike}
            className={`absolute top-5 right-5 w-16 h-16 rounded-sm border-2 border-dashed flex items-center justify-center p-2 z-10
              transition-all duration-300 transform hover:scale-110 active:scale-95
              ${isLiked 
                ? 'bg-red-500 border-red-400 text-white shadow-md' 
                : 'bg-white border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500 shadow-sm'
              }`}
            // CSS clip-path to create the postage stamp edge effect
            style={{
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
            aria-label="Like Post"
          >
            <Heart 
              className={`w-7 h-7 transition-all duration-300 
                ${isLiked ? 'fill-current text-current scale-125 animate-pop' : ''}`} 
            />
          </button>
        </div>
        
        {/* Content Section (Right Half on Desktop, Bottom Half on Mobile) */}
        <div className="w-full md:w-1/2 p-7 flex flex-col justify-between relative bg-white rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none">
          
          {/* Post Header (Location & Explore Button) */}
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
              {post.location.name}
            </h2>
            <button className="text-base text-green-600 hover:text-green-700 transition-colors duration-200 flex items-center gap-1.5 font-medium group">
              <MapPin className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-transform group-hover:scale-110" />
              <span>Explore experiences here</span>
            </button>
          </div>
          
          {/* Post Caption */}
          <div className="flex-1 overflow-hidden pr-2 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              {post.caption}
            </p>
          </div>
          
          {/* Footer (Author, Timestamp, Likes, Shares) */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-100 gap-3 sm:gap-0">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              <span className="font-semibold text-gray-800">@{post.author.username}</span> • {formatTimestamp(post.createdAt)}
            </div>
            
            <div className="flex items-center gap-6 order-1 sm:order-2">
              {/* Likes Counter */}
              <div className="flex items-center gap-1.5 text-base text-gray-600 font-semibold">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-green-500 text-green-500' : 'text-gray-400'}`} />
                <span>{currentLikes.toLocaleString()}</span>
              </div>
              
              {/* Share Button with dynamic feedback */}
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center gap-1.5 text-base text-gray-600 hover:text-green-600 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
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
      {/* Hidden input for easy copying on non-share API devices */}
      <input 
        type="text" 
        ref={shareLinkRef} 
        readOnly 
        className="absolute -left-full top-0" 
        value={`${window.location.origin}/post/${post.id}`} 
      />
    </div>
  );
}
'use client'
import PostCard from '../components/PostCard';
import { seedPosts } from '../lib/seedData';

export default function Home() {
  const handleLike = (postId, isLiked) => {
    console.log(`Post ${postId} liked:`, isLiked);
  };

  const handleShare = (postId) => {
    console.log(`Post ${postId} shared`);
  };

  return (
    <div className="p-6">
      {seedPosts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={handleLike} 
          onShare={handleShare} 
        />
      ))}
    </div>
  );
}

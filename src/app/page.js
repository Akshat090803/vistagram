
import PostCard from '../components/PostCard';
import { getPosts } from '../actions/postActions'; 

export default async function Home() { 
  const posts = await getPosts(); // Fetch real posts

  return (
    <div className="p-6 pt-3 max-w-4xl mx-auto"> 
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            
          />
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">No posts yet. Be the first to share an adventure!</p>
      )}
    </div>
  );
}
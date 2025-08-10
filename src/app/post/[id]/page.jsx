
import { getPostById } from '@/actions/postActions'; 
import PostCard from '@/components/PostCard'; 
import { notFound } from 'next/navigation'; 


export default async function SinglePostPage({ params }) {
  const { id } = params; // Get the ID from the URL parameters

  const post = await getPostById(id); 

  if (!post) {
    notFound(); // If post is not found, render Next.js's 404 page
  }

  return (
    <div className=" flex justify-center items-center p-6 max-w-4xl mx-auto"> 
      <PostCard post={post} />
    </div>
  );
}
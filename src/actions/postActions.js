'use server';

import { db as prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

//fetches all posts from db
export async function getPosts() {
  const supabase = await createClient();
  const { data: { user } = {} } = await supabase.auth.getUser(); 

  let prismaUserId = null;
  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { id: true },
      });
      if (dbUser) {
        prismaUserId = dbUser.id;
      } else {
        console.warn("getPosts: Authenticated Supabase user has no matching Prisma user profile.");
      }
    } catch (error) {
      console.error("getPosts: Error looking up Prisma user ID:", error);
    }
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc', // Sort by newest first
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        likedBy: prismaUserId ? {
          where: { userId: prismaUserId },
          select: { userId: true },
        } : false,
      },
    });

    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: prismaUserId ? post.likedBy.length > 0 : false,
      likedBy: undefined,
    }));

    return postsWithLikeStatus;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

//fetch Single Post by ID  
export async function getPostById(postId) {
  const supabase = await createClient();
  const { data: { user } = {} } = await supabase.auth.getUser();

  let prismaUserId = null;
  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { id: true },
      });
      if (dbUser) {
        prismaUserId = dbUser.id;
      }
    } catch (error) {
      console.error("getPostById: Error looking up Prisma user ID:", error);
    }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        likedBy: prismaUserId ? {
          where: { userId: prismaUserId },
          select: { userId: true },
        } : false,
      },
    });

    if (!post) {
      return null;
    }

    const postWithLikeStatus = {
      ...post,
      isLiked: prismaUserId ? post.likedBy.length > 0 : false,
      likedBy: undefined,
    };

    return postWithLikeStatus;
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    return null;
  }
}


export async function likePostAction(prevState, postId) {
  const supabase = await createClient();
  const { data: { user } = {} } = await supabase.auth.getUser();

  if (!user) {
    console.error("likePostAction: User not authenticated.");
    return { success: false, error: { message: 'Authentication required to like posts.' } };
  }

  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true },
    });
    console.log("likePostAction: Supabase user ID:", user.id, "Prisma dbUser found:", dbUser ? dbUser.id : "None");
  } catch (dbUserError) {
    console.error("likePostAction: Error finding user in DB:", dbUserError);
    return { success: false, error: { message: 'Database error finding user profile.' } };
  }

  if (!dbUser) {
    console.error("likePostAction: User profile not found for supabaseId:", user.id);
    return { success: false, error: { message: 'User profile not found in database. Please ensure you have signed up.' } };
  }

  try {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: dbUser.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      console.log(`likePostAction: Attempting to unlike post ${postId} by user ${dbUser.id}.`);
      await prisma.$transaction([
        prisma.postLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
      console.log(`likePostAction: Post ${postId} unliked by user ${dbUser.id}.`);
      revalidatePath('/');
      revalidatePath(`/post/${postId}`); // Revalidate single post page
      return { success: true, liked: false };
    } else {
      console.log(`likePostAction: Attempting to like post ${postId} by user ${dbUser.id}.`);
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            userId: dbUser.id,
            postId: postId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        }),
      ]);
      console.log(`likePostAction: Post ${postId} liked by user ${dbUser.id}.`);
      revalidatePath('/');
      revalidatePath(`/post/${postId}`); // Revalidate single post page
      return { success: true, liked: true };
    }
  } catch (error) {
    if (error.code === 'P2002') {
      console.warn(`likePostAction: Unique constraint violation - user ${dbUser.id} already liked post ${postId}.`);
      return { success: false, error: { message: 'You have already liked this post, or a concurrent operation occurred.' } };
    }
    console.error('likePostAction: Error during transaction (toggle like/update count):', error);
    return { success: false, error: { message: `Failed to toggle like: ${error.message || 'An unknown error occurred.'}` } };
  }
}


export async function sharePostAction(prevState, postId) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } },
    });
    console.log(`sharePostAction: Post ${postId} share count incremented.`);
    revalidatePath('/');
    revalidatePath(`/post/${postId}`); // Revalidate single post page
    return { success: true };
  } catch (error) {
    console.error('sharePostAction: Error sharing post:', error);
    return { success: false, error: { message: `Failed to share post: ${error.message || 'An unknown error occurred.'}` } };
  }
}
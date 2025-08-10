"use server";

import { db as prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

import { randomUUID } from "crypto";

export async function createPostServer(prevState, formData) { 
  const supabase = await createClient();

  // 1. Check authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: { message: "Unauthorized. Please log in." } };
  }

  // 2. Find user in DB 
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) return { success: false, error: { message: "User not found in database." } };

  // Extract data from FormData
  const file = formData.get('image');
  const caption = formData.get('caption');
  const locationName = formData.get('locationName');

  if (!file) {
    return { success: false, error: { message: "No image file provided." } };
  }
  if (!locationName) {
    return { success: false, error: { message: "Location cannot be empty." } };
  }

  // Check or create location
  let location = await prisma.location.findUnique({
    where: { name: locationName },
  });
  if (!location) {
    location = await prisma.location.create({ data: { name: locationName } });
  }

  // Upload image to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const filePath = `posts/${randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("vistagram-images")
    .upload(filePath, file, {
      contentType: file.type,
    });

  if (uploadError) return { success: false, error: { message: uploadError.message } };

  //  Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("vistagram-images")
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;

  //  Save post in DB
  try {
    await prisma.post.create({
      data: {
        imageUrl,
        caption: caption || null,
        authorId: dbUser.id,
        locationId: location.id,
      },
    });
    return { success: true, error: null }; 
  } catch (dbError) {
    console.error("Database error creating post:", dbError);
    return { success: false, error: { message: "Failed to save post to database." } };
  }
}
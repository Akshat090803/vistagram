"use server";

import { db as prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

import { randomUUID } from "crypto";

export async function createPostServer({ file, caption, locationName }) {
  const supabase = await createClient();

  // 1. Check authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized. Please log in.");
  }

  // 2. Find our DB user
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) throw new Error("User not found in database.");

  // 3. Check or create location
  let location = await prisma.location.findUnique({
    where: { name: locationName },
  });
  if (!location) {
    location = await prisma.location.create({ data: { name: locationName } });
  }

  // 4. Upload image to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const filePath = `posts/${randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, file, {
      contentType: file.type,
    });

  if (uploadError) throw new Error(uploadError.message);

  // 5. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;

  // 6. Save post in DB
  await prisma.post.create({
    data: {
      imageUrl,
      caption,
      authorId: dbUser.id,
      locationId: location.id,
    },
  });

  return { success: true };
}


'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from './prisma'




export async function checkUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Check if the user already exists in our DB
  const existingUser = await db.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (existingUser) {
    return existingUser
  }

  // If they don't exist, create them.
  const username = user.user_metadata?.full_name

  if (!username) {
    console.error("Could not find username in metadata for new user:", user.id)
    return null
  }

  const newUser = await db.user.create({
    data: {
      supabaseId: user.id,
      username: username,
    },
  })

  return newUser
}
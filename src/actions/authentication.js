
'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/prisma' // Assuming this is your Prisma client instance
import { redirect } from 'next/navigation'

// The function signature is updated to work with useFormState
export async function signupHandler(prevState, formData) {
  const supabase = await createClient()

  // Extract data from the FormData object
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  }

  // Basic validation
  if (!data.email || !data.password || !data.username) {
    return { error: { message: 'All fields are required.' } }
  }

  // Check if username already exists
  try {
    const existingUser = await db.user.findUnique({
      where: { username: data.username },
    })

    if (existingUser) {
      // This structure matches what the client component expects
      return { error: { username: 'This username is already taken. Please choose another.' } }
    }
  } catch (prismaError) {
    console.error("Prisma error:", prismaError);
    return { error: { message: 'Something went wrong. Please try again.' } };
  }

  // If username is available, sign up the user in Supabase
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (signUpError) {
    return { error: { message: signUpError.message } }
  }

  // If Supabase sign-up is successful, create the user profile in your Prisma DB
  if (signUpData.user) {
    try {
      await db.user.create({
        data: {
          supabaseId: signUpData.user.id,
          username: data.username,
        },
      })
    } catch (prismaError) {
      console.error("Prisma error after sign-up:", prismaError);
      return { error: { message: 'Could not save user profile. Please try again.' } };
    }
  } else {
    return { error: { message: 'Sign-up was successful, but user data was not returned.' } };
  }

  // On complete success, redirect
  redirect('/')
}


// --- Sign In handler ---
// The function signature is also updated here
export async function signInHandler(prevState, formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Correctly check for only email and password
  if (!data.email || !data.password) {
    return { error: { message: 'Email and password are required.' } }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: { message: 'Invalid login credentials. Please try again.' } }
  }

  redirect('/')
}

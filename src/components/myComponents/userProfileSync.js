'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { checkUser } from '@/lib/checkUser';


export default function UserProfileSync() {
  useEffect(() => {
    const supabase = createClient();

    // Listen for changes to the user's authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // when user sign in call run this
      if (event === 'SIGNED_IN') {
        console.log("User signed in, syncing profile...");
        checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); 

  return null;
}
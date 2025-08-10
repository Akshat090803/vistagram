
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import HeaderClient from './headerClient';

export default async function Header() {
 
  const supabase = await createClient();
  let user = null;

  if (supabase) {
    try {
      
      const { data } = await supabase.auth.getUser();

      // console.log("User loged In --- for debugging")
      
      console.log("Data.....",data)
      user = data?.user; 
    } catch (error) {
      console.error("Error getting user in Header:", error);
    }
  } else {
    console.error("Header: Supabase client is null. Check environment variables.");
  }

  return (
    <header className="bg-white shadow-sm fixed top-0 z-40 w-full">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Compass className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">
              Vistagram
            </span>
          </Link>
          <HeaderClient user={user} />
        </div>
      </nav>
    </header>
  );
}

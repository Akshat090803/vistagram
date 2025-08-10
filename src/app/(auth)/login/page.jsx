

"use client";
import { signInHandler } from "@/actions/authentication"; // Adjust path as needed
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// 1. Import the necessary hooks from 'react-dom' for Server Actions
import { useFormState, useFormStatus } from 'react-dom';

// The SubmitButton must be a separate component to use the useFormStatus hook.
// This hook provides the pending state of the parent <form>.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-all cursor-pointer mt-3 headerBtnHover"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4"/>
          Resuming your adventure...
        </>
      ) : (
        "Continue Adventure"
      )}
    </button>
  );
}

export default function SignIn() {
  // 2. useFormState manages the form's state.
  // It takes the server action (signInHandler) and an initial state.
  // It returns the current state and a new function to call the action.
  const [state, formAction] = useFormState(signInHandler, { error: null });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md overflow-hidden shadow-xl pt-0">
        <div className="relative w-full h-48">
          <Image 
            src={"https://wallpapers.com/images/hd/nature-landscape-pictures-hg4ndx87jp1rsvth.jpg"}  
            alt="An inspiring nature landscape" 
            fill
            className="object-cover"
          />
        </div>
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back, Explorer</CardTitle>
          <CardDescription className="pt-2">
            Sign in to pick up where you left off and discover what's new on the horizon.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 3. The form's 'action' prop is now bound to our formAction.
             This ensures Next.js handles the submission correctly. */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm">Email</label>
              <Input 
                id="email" 
                name="email"
                type="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm">Password</label>
              <Input 
                id="password" 
                name="password"
                type="password"
                required
              />
            </div>

            {/* 4. Display the error message from the 'state' object.
               The 'state' is updated with whatever the server action returns. */}
            {state?.error?.message && <p className="text-red-600 text-sm font-semibold text-center">{state.error.message}</p>}

            <SubmitButton />
            
            <p className="text-center text-sm text-gray-600 pt-2">
              Don't have an account?{' '}
              <Link href="/sign-up" className="font-semibold text-purple-600 hover:underline">
                Start Your Adventure
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

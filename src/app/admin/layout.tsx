'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <header className="flex justify-end items-center p-4 gap-4 h-16 bg-foreground">
              <SignedOut>
                  <SignInButton >
                      <button className="text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                          Sign In
                      </button>
                  </SignInButton>   
                  <SignUpButton>
                      <button className="bg-white text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                          Sign Up 
                      </button>
                  </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            {children}
        </div>
    );
}
    
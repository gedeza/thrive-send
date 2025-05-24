"use client"

import React from 'react';
import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function CustomUserButton({ afterSignOutUrl = '/sign-in' }: { afterSignOutUrl?: string }) {
  return (
    <ClerkUserButton
      afterSignOutUrl={afterSignOutUrl}
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
          userButtonPopoverCard: "w-56",
          userButtonPopoverActionButton: "flex items-center gap-2",
          userButtonPopoverFooter: "hidden"
        }
      }}
    />
  );
}

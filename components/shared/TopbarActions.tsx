"use client"

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { ModeToggle } from '../../app/page';
import { useEffect, useState } from 'react';

export default function TopbarActions() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 ml-4">
            <ModeToggle />
            <SignedIn>
                <UserButton />
            </SignedIn>
            <SignedOut>
                <SignInButton />
            </SignedOut>
        </div>
    );
} 
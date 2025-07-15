// WorkUp/components/shared/Topbar.tsx
"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Bookmark, Heart, Menu, Pencil, X } from 'lucide-react'; // Icons for the hamburger menu
import { ModeToggle } from '../../app/page'; // Assuming this path is correct
import { Button } from '../ui/button'; // Assuming you have a Button component from shadcn/ui
import TopbarActions from './TopbarActions';

const Topbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useUser();
    const router = usePathname ? undefined : undefined; // placeholder for linter
    function handleProtectedNav(e: React.MouseEvent, href: string) {
      if (!user) {
        e.preventDefault();
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(href)}`;
      }
    }
    return (
    <header className="sticky top-0 z-50 w-full bg-white/50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 w-full">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 tracking-tight">
            <span className="flex items-center gap-2">
              WorkUp
            </span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-base font-medium ml-8">
            <Link href="/home/job-list" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Job Listings</Link>
            <Link href="/home/post-jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={e => handleProtectedNav(e, '/home/post-jobs')}>Post a Job</Link>
            <Link href="/home/my-jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={e => handleProtectedNav(e, '/home/my-jobs')}>My Jobs</Link>
          </nav>
          {/* Hamburger for mobile */}
          <button
            className="md:hidden ml-auto p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={28} className="text-blue-600 dark:text-blue-400" /> : <Menu size={28} className="text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
        <TopbarActions />
      </div>
      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <nav className="md:hidden bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shadow-lg animate-fade-in-down">
          <div className="flex flex-col gap-2 px-6 py-4">
            <Link href="/home/job-list" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>
              <Bookmark size={20} /> Job Listings
            </Link>
            <Link href="/home/post-jobs" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={e => { setMenuOpen(false); handleProtectedNav(e, '/home/post-jobs'); }}>
              <Pencil size={20} /> Post a Job
            </Link>
            <Link href="/home/my-jobs" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={e => { setMenuOpen(false); handleProtectedNav(e, '/home/my-jobs'); }}>
              <Heart size={20} /> My Jobs
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Topbar;
"use client"

import * as React from "react"
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import { Briefcase, Search as SearchIcon } from "lucide-react";
import Link from "next/link";

// Default filter state

const Page = () => {
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/home/job-list?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-transparent gap-16">
      {/* Seeker Landing Section */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 pb-12 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-center mb-2">
          <SearchIcon className="text-blue-600 dark:text-blue-400" size={64} />
        </div>
        <h1 className="text-4xl font-bold text-foreground text-center">Welcome, Job Seeker!</h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl">
          Discover your next opportunity. Browse jobs, save your favorites, and apply with confidence.
        </p>
        <form onSubmit={handleSearch} className="w-full flex flex-col items-center gap-6">
          <input
            className="w-full text-2xl md:text-3xl px-6 py-5 rounded-xl border border-gray-300 dark:border-zinc-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold transition"
            placeholder="Search for jobs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Poster Landing Section */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 pt-8">
        <div className="flex justify-center mb-2">
          <Briefcase className="text-blue-600 dark:text-blue-400" size={64} />
        </div>
        <h1 className="text-4xl font-bold text-foreground text-center">Welcome, Job Poster!</h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl">
          Find the best talent for your company. Post jobs, manage applicants, and grow your team with ease.
        </p>
        <Link href="/home/post-jobs">
          <Button size="lg" className="mt-4">Post a Job</Button>
        </Link>
      </div>
    </div>
  )
}

export default Page
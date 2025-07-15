import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SeekerLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Search className="text-primary" size={64} />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, Job Seeker!</h1>
        <p className="text-lg text-muted-foreground">
          Discover your next opportunity. Browse jobs, save your favorites, and apply with confidence.
        </p>
        <Link href="/home/job-list">
          <Button size="lg" className="mt-4">Find Jobs</Button>
        </Link>
      </div>
    </div>
  );
} 
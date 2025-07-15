import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function PosterLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Briefcase className="text-primary" size={64} />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, Job Poster!</h1>
        <p className="text-lg text-muted-foreground">
          Find the best talent for your company. Post jobs, manage applicants, and grow your team with ease.
        </p>
        <Link href="/home/post-jobs">
          <Button size="lg" className="mt-4">Post a Job</Button>
        </Link>
      </div>
    </div>
  );
} 
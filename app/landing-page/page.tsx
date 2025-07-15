import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Search } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center space-y-10">
        <h1 className="text-4xl font-bold text-foreground mb-8">Welcome to WorkUp</h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <Link href="/landing-page/poster" className="flex-1">
            <Button variant="outline" size="lg" className="w-full h-40 flex flex-col items-center justify-center gap-4 text-2xl">
              <Briefcase className="text-primary" size={48} />
              I am a Job Poster
            </Button>
          </Link>
          <Link href="/landing-page/seeker" className="flex-1">
            <Button variant="outline" size="lg" className="w-full h-40 flex flex-col items-center justify-center gap-4 text-2xl">
              <Search className="text-primary" size={48} />
              I am a Job Seeker
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
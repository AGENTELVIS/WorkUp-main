// app/job-details/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import  createClerkSupabaseClient  from "@/app/supabase/supabasecClient";
import { ApplyJobDialog } from "@/components/shared/ApplyJob";
import { useUser } from "@clerk/nextjs";
import PosterJobView from "@/components/shared/PosterJobView";
import SeekerJobView from "@/components/shared/SeekerJobView";
import { getJobWithCounts } from "@/lib/jobsapi";

export default function JobDetailsPage() { 
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const supabase = createClerkSupabaseClient();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function fetchJob() {
      if (!id) {
        setLoading(false);
        return;
      }
  
      try {
        const jobData = await getJobWithCounts(supabase, id as string);
  
        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("auto_close")
          .eq("job_id", jobData.id)
          .maybeSingle(); // ✅ use maybeSingle
  
        if (settingsError && settingsError.code !== "PGRST116") {
          console.error("Error fetching settings:", settingsError);
        }
  
        const jobWithSettings = {
          ...jobData,
          settings: settings ?? { auto_close: false }, // fallback
        };
  
        setJob(jobWithSettings);
      } catch (error) {
        console.error("Failed to fetch job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }
  
    fetchJob();
  }, [id, user]);
  

  if (loading || !isLoaded) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  const isPoster = user?.id === job.user_id;

  return (
    <div className="min-h-screen w-full flex flex-col items-start justify-start py-12 px-4">
      {isPoster ? (
        <PosterJobView job={job} setJob={setJob} />
      ) : (
        <SeekerJobView job={job} />
      )}
    </div>
  );
} 
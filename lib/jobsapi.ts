"use client"
import  createClerkSupabaseClient  from "@/app/supabase/supabasecClient";
import { useUser } from "@clerk/nextjs";
import { ParamValue } from "next/dist/server/request/params";
import { useEffect, useState } from "react";

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();

  // Fetch initial jobs
  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
    .from("postjob").select("*")
    .neq('user_id', user?.id)
    .neq('status', 'closed')
    
    .order("created_at", { ascending: false });
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs(); // initial load

    const channel = supabase
      .channel("jobs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postjob" },
        (payload) => {
          const { eventType, new: newJob, old: oldJob } = payload;

          setJobs((prev) => {
            if (eventType === "INSERT") {
              return [newJob, ...prev];
            }
            if (eventType === "UPDATE") {
              return prev.map((job) =>
                job.id === newJob.id ? newJob : job
              );
            }
            if (eventType === "DELETE") {
              return prev.filter((job) => job.id !== oldJob.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { jobs, loading };
}

export async function getJobWithCounts(supabase: ReturnType<typeof createClerkSupabaseClient>,jobId: string) {

  // Fetch the job
  const { data: job, error } = await supabase
    .from("postjob")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) throw new Error("Job not found");

  // Fetch applicant count & saved count in parallel
  const [applicantsRes, savedRes] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId),
    supabase
      .from("savedjobs")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId),
  ]);

  return {
    ...job,
    applicantCount: applicantsRes.count || 0,
    savedCount: savedRes.count || 0,
  };
}


export async function saveJob(supabase: ReturnType<typeof createClerkSupabaseClient>, userId: string, jobId: number){
  const { data, error } = await supabase.from("savedjobs").insert({
    user_id: userId,
    job_id: jobId,
  });
  if (error) throw error;
  return data;
}

export async function unsaveJob(supabase: ReturnType<typeof createClerkSupabaseClient>, userId: string, jobId: number) {
  const { error } = await supabase
    .from("savedjobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  return true;
}

"use client";

import { useUser } from "@clerk/nextjs";
import { Bookmark, MapPin, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { useJobs, saveJob, unsaveJob } from "@/lib/jobsapi";
import  createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import JobFilters, { JobFiltersState } from "@/components/shared/Filters";

const Joblist = () => {
  const { user } = useUser();
  const { jobs, loading } = useJobs();
  const supabase = createClerkSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams();
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [filters, setFilters] = useState<JobFiltersState>({
    search: "",
    company: "",
    location: "",
    jobtype: [],
    workplace: "",
  });

  // On mount, set search filter from URL param if present
  useEffect(() => {
    const searchQ = searchParams.get("search") || "";
    if (searchQ && !filters.search) {
      setFilters((prev) => ({ ...prev, search: searchQ }));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from("savedjobs")
        .select("job_id")
        .eq("user_id", user.id);
      if (!error && data) {
        setSavedJobs(data.map((row: any) => row.job_id));
      }
    };
    fetchSaved();
  }, [user]);

  const handleClick = (id: number) => {
    router.push(`/home/job-page/${id}`);
  };

  async function handleToggleSave(jobId: number) {
    if (!user) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const isSaved = savedJobs.includes(jobId);
    try {
      if (isSaved) {
        await unsaveJob(supabase, user.id, jobId);
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await saveJob(supabase, user.id, jobId);
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Save/Unsave error:", err);
      alert("Failed to update saved jobs.");
    }
  }
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job: any) => job.user_id !== user?.id)
      .filter((job: any) => job.status !== "closed")
      .filter((job: any) =>
        job.title.toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter((job: any) =>
        filters.company ? job.company === filters.company : true
      )
      .filter((job: any) =>
        filters.location ? job.location === filters.location : true
      )
      .filter((job: any) =>
        filters.jobtype.length > 0 ? filters.jobtype.includes(job.jobtype) : true
      )
      .filter((job: any) =>
        filters.workplace ? job.workplace === filters.workplace : true
      );
  }, [jobs, filters, user?.id]);
  

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      <JobFilters filters={filters} setFilters={setFilters} />
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 p-2 sm:p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl shadow">
          {loading && <p className="text-gray-600 dark:text-gray-300">Loading jobs...</p>}
          {!loading && filteredJobs.length === 0 && <p className="text-gray-600 dark:text-gray-300">No jobs found.</p>}

          {!loading &&
            filteredJobs.filter((job: any) => job.user_id !== user?.id).filter((job: any) => job.status !== 'closed')
            .map((job: any) => (
              <div key={job.id} className="border-b dark:border-zinc-800 last:border-b-0 pb-3 mb-3 last:mb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-2 sm:gap-0">
                  <div className="flex-1" onClick={() => handleClick(job.id)}>
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 mt-1">
                      <Building2 size={16} className="inline-block" /> {job.company}
                      <span className="mx-1">•</span>
                      <MapPin size={16} className="inline-block" /> {job.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-2 sm:mt-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-zinc-800 transition group"
                          onClick={() => handleToggleSave(job.id)}
                          aria-label="Save job"
                        >
                          {savedJobs.includes(job.id) ? (
                            <Bookmark className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400 transition" size={22} />
                          ) : (
                            <Bookmark className="text-gray-400 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" size={22} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Save job</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
};


export default Joblist;

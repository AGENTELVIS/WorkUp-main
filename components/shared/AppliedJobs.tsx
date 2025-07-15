"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const AppliedJobs = () => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchAppliedJobs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("applications")
        .select(`
            id,
            job_id,
            status,
            postjob:job_id (
            id,
            title,
            company,
            location,
            jobdesc,
            created_at
            )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Fetch saved jobs error:", error);
      } else {
        setJobs(data);
      }

      setLoading(false);
    };

    fetchAppliedJobs();
  }, [user]); // Only refetch when user changes

  if (loading) return <p>Loading saved jobs...</p>;

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No jobs applied for..</p>
      ) : (
        jobs.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm p-5 transition hover:shadow-md cursor-pointer"
            onClick={() => router.push(`/home/job-page/${item.job_id}`)}
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.postjob.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.postjob.company} — {item.postjob.location}
            </p>
            <Badge
              variant="secondary"
              className="w-fit capitalize rounded px-3 py-1 text-xs font-medium"
            >
              {item.status}
            </Badge>
          </div>
        ))
      )}
    </div>
  )
}

export default AppliedJobs
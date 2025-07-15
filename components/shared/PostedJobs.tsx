"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { useRouter } from "next/navigation";
import { Ellipsis, EllipsisVertical, Pencil, Users, Users2, UserSquare2 } from "lucide-react";
import { Badge } from "../ui/badge";
import ManageJobDropdown from "./ManageJobDropdown";

const PostedJobs = () => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    fetchPostedJobs();
  }, [user]);

  const fetchPostedJobs = async () => {
    setLoading(true);

    const { data: jobs, error: jobsError } = await supabase
      .from("postjob")
      .select("id, title, company, location, jobdesc, created_at,status")
      .eq("user_id", user?.id);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      setLoading(false);
      return;
    }

    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const { count, error: countError } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("job_id", job.id);

        return {
          ...job,
          hasApplicants: count && count > 0,
          applicantCount: count || 0,
        };
      })
    );

    setJobs(jobsWithApplicants);
    setLoading(false);
  };

  if (loading) return <p>Loading saved jobs...</p>;

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No jobs posted yet.</p>
      ) : (
        jobs.map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm p-5 transition hover:shadow-md cursor-pointer"
            onClick={() => router.push(`/home/job-page/${item.id}`)}
          >
            <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
              <ManageJobDropdown 
                jobId={item.id}
                jobStatus={item.status}
                applicantCount={item.applicantCount}
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.company} — {item.location}
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
  );
};

export default PostedJobs;

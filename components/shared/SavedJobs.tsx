"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { useRouter } from "next/navigation";

const SavedJobs = () => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchSavedJobs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("savedjobs")
        .select(
          `
            id,
            job_id,
            postjob (
              id,
              title,
              company,
              location,
              jobdesc,
              created_at
            )
          `
        )
        .eq("user_id", user.id); // Use user.id safely here

      if (error) {
        console.error("Fetch saved jobs error:", error);
      } else {
        setJobs(data);
      }

      setLoading(false);
    };

    fetchSavedJobs();
  }, [user]); // Only refetch when user changes

  if (loading) return <p>Loading saved jobs...</p>;

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No saved jobs yet.</p>
      ) : (
        jobs.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm p-5 transition hover:shadow-md cursor-pointer"
            onClick={() => router.push(`/home/job-page/${item.job_id}`)}
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{item.postjob.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.postjob.company} — {item.postjob.location}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default SavedJobs;

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ApplyJobDialog } from "./ApplyJob";
import { useUser } from "@clerk/nextjs";
import { formatPostedTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { CircleAlert, CircleX } from "lucide-react";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { saveJob, unsaveJob } from "@/lib/jobsapi";
import { toast } from "sonner";


export default function SeekerJobView({ job }: { job: any }) {
    const router = useRouter()
    const { user } = useUser();
    const isPoster = user?.id === job.user_id;
    const [appStatus, setAppStatus] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);
    const supabase = createClerkSupabaseClient();
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      async function fetchStatus() {
        if (!user) { setAppStatus(null); setChecking(false); return; }
        const { data, error } = await supabase
          .from('applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('job_id', job.id)
          .maybeSingle();
        setAppStatus(data?.status || null);
        setChecking(false);
      }
      fetchStatus();
    }, [user, job.id]);

    useEffect(() => {
      async function checkSaved() {
        if (!user) { setIsSaved(false); return; }
        const { data } = await supabase
          .from('savedjobs')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', job.id)
          .maybeSingle();
        setIsSaved(!!data);
      }
      checkSaved();
    }, [user, job.id]);

    async function handleSave() {
      if (!user) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setSaving(true);
      try {
        if (isSaved) {
          await unsaveJob(supabase, user.id, job.id);
          setIsSaved(false);
          toast.success("Job removed from saved.");
        } else {
          await saveJob(supabase, user.id, job.id);
          setIsSaved(true);
          toast.success("Job saved!");
        }
      } catch (err) {
        toast.error("Failed to update saved jobs.");
      } finally {
        setSaving(false);
      }
    }

    function handleShare() {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      toast.success("Job link copied to clipboard!");
    }

  return (
    <div>
      <h1 className="font-bold mb-2 text-foreground text-3xl">{job.title}</h1>
      <p className="mb-4 text-muted-foreground text-xl">{job.company} • {job.location}</p>
      <p className="mb-2 text-muted-foreground text-xl">Applicants: {job.applicantCount}</p>
      <p>Posted {formatPostedTime(job.created_at)}</p>

      <div className="flex gap-3 mt-4 mb-2">
        <Button
          variant={isSaved ? "secondary" : "outline"}
          size="icon"
          aria-label={isSaved ? "Unsave job" : "Save job"}
          onClick={handleSave}
          disabled={saving}
        >
          {isSaved ? <BookmarkCheck className="text-blue-600" /> : <Bookmark />}
        </Button>
        <Button variant="outline" size="icon" aria-label="Share job" onClick={handleShare}>
          <Share2 />
        </Button>
      </div>

      <div
        className="prose dark:prose-invert mt-6"
        dangerouslySetInnerHTML={{ __html: job.jobdesc }}
      />

      {(!isPoster) && (
        checking ? (
          <Button disabled>Loading...</Button>
        ) : appStatus === 'withdrawn' ? (
          <div className="text-red-500 font-semibold mt-4">Application withdrawn</div>
        ) : appStatus === 'accepted' ? (
          <div className="text-green-600 font-semibold mt-4">Application accepted</div>
        ) : appStatus === 'rejected' ? (
          <div className="text-red-600 font-semibold mt-4">Application rejected</div>
        ) : job.status === 'paused' ? (
          <p className="text-yellow-600 font-semibold mt-4 flex gap-2" >
            <CircleAlert/> This job is temporarily paused.
          </p>
        ) : job.status === 'closed' ? (
          <p className="text-red-600 font-semibold mt-4 flex gap-2">
            <CircleX/> This job is no longer accepting applicants.
          </p>
        ) : (
          user ? (
            <ApplyJobDialog
              jobId={job.id}
              screeningQuestions={job.screeningquestions || []}
              disabled={isPoster}
            />
          ) : (
            <Button onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>
              Sign in to Apply
            </Button>
          )
        )
      )}
    </div>
  );
}

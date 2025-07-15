import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Pencil, SquarePen } from "lucide-react";
import { Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { formatPostedTime } from "@/lib/utils";
import { toast } from "sonner";

export default function PosterJobView({
  job,
  setJob,
}: {
  job: any;
  setJob: (job: any) => void;
}) {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const router = useRouter();

  const handleStatusChange = async (jobid: number, newStatus: string) => {
    const { error } = await supabase
      .from("postjob")
      .update({ status: newStatus })
      .eq("id", jobid);

    if (error) {
      console.error("Failed to update status:", error);
      return;
    }

    // ✅ Update local job state to reflect new status
    setJob({ ...job, status: newStatus });
  };

    
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-start justify-between w-full mb-2">
        <div>
          <h1 className="font-bold mb-2 text-foreground text-3xl">{job.title}</h1>
          <p className="mb-4 text-muted-foreground text-xl">{job.company} • {job.location}</p>
        </div>
        <div className="flex gap-2 items-center">
          <SquarePen
            onClick={() => {
              if (job.applicantCount === 0) {
                router.push(`/home/post-jobs/${job.id}`);
              }
            }}
            className={`ml-4 mt-1 ${
              job.applicantCount > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer underline"
            }`}
            size={28}
          />
          <Button variant="outline" size="icon" aria-label="Share job" onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            toast.success("Job link copied to clipboard!");
          }}>
            <Share2 />
          </Button>
        </div>
      </div>
      <p>Posted {formatPostedTime(job.created_at)}</p>
      <div className="flex flex-wrap gap-8 items-center justify-between">
        <p className="text-muted-foreground text-xl"><strong>Status:</strong> {job.status}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Change Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["open", "paused", "closed"].map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                onClick={() => handleStatusChange(job.id, statusOption)}
              >
                {statusOption}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-8 mt-2">
        <p className="text-muted-foreground text-xl">Applicants: {job.applicantCount}</p>
        <p className="text-muted-foreground text-xl">Saved by: {job.savedCount}</p>
      </div>

      {job.applicantCount > 0 && (
        <div className="flex gap-4 mt-6">
          <Button onClick={() => router.push(`/home/post-jobs/${job.id}/applicants`)}>
            View Applicants
          </Button>
        </div>
      )}
      {user?.id === job.user_id && job.settings && (
        <div className="flex items-center gap-2 mt-4">
          <Label>Auto-close when openings filled</Label>
          <Switch
            checked={job.settings.auto_close}
            onCheckedChange={async (val) => {
              const { error } = await supabase
                .from("settings")
                .update({ auto_close: val })
                .eq("job_id", job.id)
                .single()

              if (!error) {
                setJob({
                  ...job,
                  settings: {
                    ...job.settings,
                    auto_close: val,
                  },
                });
              }
            }}
          />
        </div>
      )}


    </div>
  );
}

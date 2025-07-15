import React, { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, Pencil, Users } from 'lucide-react'
import createClerkSupabaseClient from '@/app/supabase/supabasecClient';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ManageJobDropdown = ({ jobId, jobStatus, applicantCount }: { jobId: string, jobStatus: string, applicantCount: number }) => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [hasInprogress, setHasInprogress] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || !jobId) return;
    const checkInprogress = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("status")
        .eq("job_id", jobId);
      if (!error && data) {
        setHasInprogress(data.some((a: any) => a.status === "inprogress"));
      }
    };
    checkInprogress();
  }, [user, jobId]);

  async function handleDelete() {
    // Actually delete the job
    const { error } = await supabase.from("postjob").delete().eq("id", jobId);
    if (!error) {
      setShowDeleteDialog(false);
      router.refresh();
    } else {
      alert("Failed to delete job.");
    }
  }

  return (
    <div>
      <DropdownMenu >
        <DropdownMenuTrigger>
          <Ellipsis className="mt-0.5 mr-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem className='flex items-center gap-2' onClick={() => router.push(`/home/job-page/${jobId}`)}>
                <Pencil className="w-4 h-4" />
                Manage Job
          </DropdownMenuItem>
          <DropdownMenuSeparator/>
          {/* Delete logic: */}
          {(applicantCount === 0 || (jobStatus === "closed" && !hasInprogress)) ? (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={e => e.preventDefault()}>Delete</DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Job?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this job? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-yellow-600" onSelect={e => e.preventDefault()}>Close job to delete</DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cannot Delete Job</DialogTitle>
                  <DialogDescription>
                    This job has in-progress applicants and is still open. Please close the job before deleting.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">OK</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ManageJobDropdown;
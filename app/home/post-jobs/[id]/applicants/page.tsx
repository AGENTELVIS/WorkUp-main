// pages/view-applicants/[jobId].tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatPostedTime } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Applicant = {
  postjob: {
    user_id: string;
  };
};

export default function ViewApplicantsPage() {
  const { id } = useParams();
  const client = createClerkSupabaseClient();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useUser()
  
  const router = useRouter()
  const [confirm, setConfirm] = useState<{id: number, status: string} | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleStatusChange = async (applicantid: number, newStatus: string) => {
    if (["accepted", "rejected"].includes(newStatus)) {
      setConfirm({id: applicantid, status: newStatus});
      setAlertOpen(true);
      return;
    }
    await doStatusChange(applicantid, newStatus);
  };

  const doStatusChange = async (applicantid: number, newStatus: string) => {
    const { error } = await client
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicantid);

    if (error) {
      console.error("Failed to update status:", error);
      return;
    }
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantid ? { ...a, status: newStatus } : a
      )
    );
    setConfirm(null);
  };

  useEffect(() => {
    if (!id || !user) return
    
    const fetchApplicants = async () => {
      const { data, error } = await client
        .from("applications")
        .select(`
          *,
          postjob:job_id(
          user_id
          )
          `)
        .eq("job_id", id);

      if (error) {
        console.error("Failed to fetch applicants:", error);
        setLoading(false);
        return;
      }
      const typedData = data as Applicant[];

      if (typedData[0]?.postjob?.user_id !== user?.id) {
        toast.error("Access Denied", {
          description: "You are not allowed to view applicants for this job.",
        });
        setTimeout(() => {
          router.push("/home/job-list");
        }, 1500);
        return;
      }
      // Generate signed URLs
      const applicantsWithUrls = await Promise.all(
        data.map(async (applicant) => {
          if (!applicant.resume_path) return applicant;

          const { data: signed, error: signedError } = await client.storage
            .from("resume")
            .createSignedUrl(applicant.resume_path, 60); // 60 sec validity

          return {
            ...applicant,
            signedUrl: signed?.signedUrl || null,
          };
        })
      );

      setApplicants(applicantsWithUrls);
      setLoading(false);
    };

    fetchApplicants();
  }, [id,user]);

  if (loading) return <p>Loading applicants...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Applicants</h1>
      {applicants.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg py-16">No applicants yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {applicants.map((a) => (
            <div
              key={a.id}
              className="w-full bg-white dark:bg-zinc-900 shadow rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Email:</span>
                    <span className="text-gray-900 dark:text-gray-100 break-all">{a.email}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Phone No.:</span>
                    <span className="text-gray-900 dark:text-gray-100">{a.phone}</span>
                  </div>
                  {a.created_at && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">submitted {formatPostedTime(a.created_at)}</div>
                  )}
                  {a.withdraw_reason && (
                    <div className="text-xs text-red-500 dark:text-red-400 mt-1">Reason: {a.withdraw_reason}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${a.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      a.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      a.status === 'withdrawn' ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}
                  >
                    {a.status}
                  </span>
                  {/* Only allow status change if not withdrawn, accepted, or rejected */}
                  {!(a.status === 'withdrawn' || a.status === 'accepted' || a.status === 'rejected') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Change Status</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {["inprogress", "accepted", "rejected"].map((statusOption) => (
                          <DropdownMenuItem
                            key={statusOption}
                            onClick={() => handleStatusChange(a.id, statusOption)}
                          >
                            {statusOption}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {a.signedUrl ? (
                  <a
                    href={a.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" className="flex items-center gap-2">
                      <SquareArrowOutUpRightIcon className="size-4" />
                      View Resume
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-red-400 dark:text-red-300">No resume available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirmation Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set this application to <span className="font-semibold">{confirm?.status}</span>? <br/>
              <span className="text-red-500">This action is irreversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setAlertOpen(false); setConfirm(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (confirm) await doStatusChange(confirm.id, confirm.status); setAlertOpen(false); setConfirm(null); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
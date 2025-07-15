import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useUser } from "@clerk/nextjs"
import createClerkSupabaseClient from "@/app/supabase/supabasecClient"
import { useState } from "react"

const WithdrawAppDialog = ({ jobId, onWithdraw }: { jobId: string, onWithdraw: () => void }) => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleWithdraw = async () => {
    if (!user) return;
    setLoading(true);
  
    const { error } = await supabase
      .from('applications')
      .update({
        status: 'withdrawn',
        withdraw_reason: message,
      })
      .eq('user_id', user.id)
      .eq('job_id', jobId);
  
    setLoading(false);
  
    if (!error) {
      if (onWithdraw) onWithdraw();
    } else {
      alert('❌ Failed to withdraw application.');
    }
  };
  

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button>Withdraw Application</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Withdraw Application</DialogTitle>
            </DialogHeader>
            <Textarea placeholder="Type your message here." value={message} onChange={(e) => setMessage(e.target.value)} />
            <DialogDescription>
                Are you sure you want to withdraw your application?
            </DialogDescription>
            <DialogFooter>
                <Button type="submit" variant="destructive" onClick={handleWithdraw} disabled={loading}>{loading ? "Withdrawing..." : "Withdraw"}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default WithdrawAppDialog
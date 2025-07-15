'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"

import { useUser } from "@clerk/nextjs"
import createClerkSupabaseClient from "@/app/supabase/supabasecClient"
import { User } from "@clerk/nextjs/server"
import WithdrawAppDialog from "./WithdrawAppDialog"

const applySchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10,{message:"Phone number must be at least 10 digits"}),
  resume: z.any()
    .refine((file) => file?.length === 1, { message: "Resume required" })
    .refine((file) => ["application/pdf"].includes(file?.[0]?.type), {
      message: "Must be PDF",
    }),
  answers: z.array(z.object({ answer: z.string().min(1) })),
})

type ApplyFormType = z.infer<typeof applySchema>

export function ApplyJobDialog({ jobId, screeningQuestions, disabled = false, onApplied }: {
  jobId: string,
  screeningQuestions: { question: string }[],
  disabled: boolean,
  onApplied?: () => void
}) {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [step, setStep] = useState(1);
  const [applied, setApplied] = useState(false);
  const [checking, setChecking] = useState(true);
  const hasQuestions = screeningQuestions.length > 0;
  const [success, setSuccess] = useState(false);

  // Check if user has already applied
  useEffect(() => {
    async function checkApplied() {
      if (!user) {
        setApplied(false);
        setChecking(false);
        return;
      }
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .maybeSingle();
      setApplied(!!data);
      setChecking(false);
    }
    checkApplied();
  }, [user, jobId]);

  const form = useForm<ApplyFormType>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      email: "",
      phone: "",
      resume: undefined,
      answers: screeningQuestions.map(() => ({ answer: "" })),
    },
  });

  const { register, handleSubmit, watch, formState: { errors }, reset } = form;

  const closeAndReset = () => {
    reset();
    setStep(1);
  };

  const onSubmit = async (values: ApplyFormType) => {
    try {
      const file = values.resume[0];
      const ext = file.name.split('.')?.pop();
      const filePath = `resume/${user?.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('resume')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { error } = await supabase.from('applications').insert({
        user_id: user?.id,
        job_id: jobId,
        email: values.email,
        phone: values.phone,
        resume_path: filePath,
        status: 'inprogress',
        answers: screeningQuestions.map((q, i) => ({
          question: q.question,
          answer: values.answers?.[i]?.answer || "",
        })),
      });

      if (error) throw error;

      setApplied(true);
      setSuccess(true);
      if (onApplied) onApplied();
      setTimeout(() => {
        setSuccess(false);
        closeAndReset();
      }, 1500);
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div>
      {applied || disabled ? (
        <div className="flex items-center gap-2">
          <Button disabled variant="secondary">Applied</Button>
          <WithdrawAppDialog jobId={jobId} onWithdraw={() => { setApplied(false); if (onApplied) onApplied(); closeAndReset(); }} />
        </div>
      ) : (
        <Dialog onOpenChange={(open) => !open && closeAndReset()}>
          <DialogTrigger asChild>
            <Button disabled={checking || disabled}>Apply</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 rounded-xl overflow-hidden">
            <Card className="shadow-none border-none bg-transparent">
              <CardContent className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2">Apply for this Job</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-gray-500 text-sm">Please fill out the form below to apply. All fields are required.</div>
                {success ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="text-green-500 mb-2" size={48} />
                    <div className="text-lg font-semibold text-green-700 mb-1">Application Submitted!</div>
                    <div className="text-gray-500 text-sm">Thank you for applying. We'll notify you if you're shortlisted.</div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-6 rounded-lg">
                        <div className="font-medium text-base mb-2">Contact Information</div>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="resume"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resume <span className="text-xs text-gray-400">(PDF only)</span></FormLabel>
                              <FormControl>
                                <Input type="file" onChange={e => field.onChange(e.target.files)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {hasQuestions && (
                        <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                          <div className="font-medium text-base mb-2">Screening Questions</div>
                          {screeningQuestions.map((q, index) => (
                            <FormField
                              key={index}
                              control={form.control}
                              name={`answers.${index}.answer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{q.question}</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between gap-2 mt-6">
                        {hasQuestions && step === 2 && (
                          <Button type="button" variant="outline" onClick={() => setStep(1)}>
                            Back
                          </Button>
                        )}
                        <Button type="submit" className="flex-1">
                          Submit Application
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
                <DialogClose asChild>
                  <Button variant="ghost" className="mt-4 w-full" onClick={closeAndReset}>Cancel</Button>
                </DialogClose>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
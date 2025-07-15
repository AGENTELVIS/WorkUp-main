"use client"

import React, { useEffect, useRef, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from '@/components/ui/button'
import { Form,FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { useUser } from '@clerk/nextjs'
import  createClerkSupabaseClient  from '@/app/supabase/supabasecClient'
import CompanyDialog  from '@/components/shared/AddCompany'
import RichTextEditor from '@/components/shared/Editor'
import CompanySeletor from '@/components/shared/CompanySeletor'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import {State} from 'country-state-city'
import { useRouter } from "next/navigation";
import { redirect, useParams } from 'next/navigation'
import ScreeningQuestions from "@/components/shared/ScreenQuestions";
import { postSchema } from '@/lib/validation'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { toast } from 'sonner'
import { Variable } from 'lucide-react'
import { toggleVariants } from '../ui/toggle'
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PostJobForm() {
  const [content, setContent] = useState<string>("");
  const {user} = useUser()
  const client = createClerkSupabaseClient()
  const { id } = useParams(); // job id
  const isEditing = !!id;
  const hasFetched = useRef(false);
  const router = useRouter();
  const [date,setDate] = useState<Date | undefined>(new Date())
  const [step, setStep] = useState(1); // Stepper state

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      company:"",
      location:"",
      jobtype:"",
      workplace:"",
      screeningquestions:[],
      openings:1,
    },
  })
  const { watch, setValue } = form;
  const screeningQuestions = watch("screeningquestions");

  useEffect(() => {
    async function fetchJob() {
      if (!isEditing || hasFetched.current) return;
      hasFetched.current = true;

      // Fetch job data
      const { data: job, error } = await client
        .from("postjob")
        .select("*")
        .eq("id", id)
        .single();

      if (!job || error) {
        console.error("Job not found or error:", error);
        router.push("/home/job-list");
        return;
      }

      // ✅ Check if job has applicants
      const { count, error: countError } = await client
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", id);

      if (count && count > 0) {
        toast.error("Editing is not allowed",{
          description: "Job already has applicants."},
        );
        setTimeout(() => {
          router.push("/home/job-list");
        }, 0);

        return;
      }
      if (job.user_id !== user?.id) {
        toast.error("Access Denied",{
          description: "You are not allowed to edit this job."},
        );
        setTimeout(() => {
          router.push("/home/job-list");
        }, 0);

        return;
      }


      form.reset({
        title: job.title,
        company: job.company,
        location: job.location,
        jobtype: job.jobtype,
        workplace: job.workplace,
        openings: job.openings,
        screeningquestions: job.screeningquestions,
      });
      setContent(job.jobdesc);
    }

    fetchJob();
  }, [id, user]);


  async function onSubmit(values: z.infer<typeof postSchema>) {
    const payload = {
      title: values.title,
      company: values.company,
      location: values.location,
      jobtype: values.jobtype,
      workplace: values.workplace,
      openings: values.openings,
      screeningquestions: values.screeningquestions,
      jobdesc: content,
      user_id: user?.id,
    };

    const { data,error } = isEditing
      ? await client.from("postjob").update(payload).eq("id", id)
      : await client.from("postjob").insert(payload);

    if (error) {
      console.error("Error saving job:", error);
      alert("Error saving job. Check console.");
      return;
    }
    console.log("Update result:", { data, error });
    redirect("/home/job-list");
  }

  // --- Stepper Navigation ---
  const goNext = () => setStep((s) => Math.min(s + 1, 2));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950 shadow-lg border border-gray-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">{isEditing ? 'Edit Job' : 'Post a New Job'}</h2>
      <p className="mb-6 text-gray-500 dark:text-gray-300">Fill in the details below to {isEditing ? 'update' : 'create'} your job posting.</p>
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step === 1 ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>1 <span className="hidden sm:inline">Job Details</span></div>
        <div className="h-1 w-8 bg-gray-200 dark:bg-zinc-800 rounded" />
        <div className={`flex items-center gap-2 ${step === 2 ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>2 <span className="hidden sm:inline">More Info</span></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-6 w-full">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input className="w-full" placeholder="Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <div className="flex items-end gap-2 w-full">
                        <div className="flex-1">
                          <FormLabel className='mb-2'>Company Name</FormLabel>
                          <FormControl>
                            <CompanySeletor value={field.value} onChange={field.onChange}/>
                          </FormControl>
                        </div>
                        <CompanyDialog />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="location"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Job Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {State.getStatesOfCountry("IN").map(({ name }) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Job Description</h3>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-8">
                <Button type="button" onClick={goNext} className="w-32">Next</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex flex-col gap-6 w-full">
                <FormField
                  control={form.control}
                  name="openings"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Openings</FormLabel>
                      <FormControl>
                        <Input className="w-full" type='number' min={1} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <h3 className="font-semibold text-lg rounded-lg mb-2 text-gray-700 dark:text-gray-200">Job Type</h3>
                  <FormField
                    control={form.control}
                    name="jobtype"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="w-full"
                          >
                            {['Full Time','Part Time','Internship','Contract','Volunteer','Other'].map((type) => (
                              <ToggleGroupItem
                                key={type}
                                value={type}
                                className={cn(
                                  'border rounded-sm px-4 py-2 mx-1 my-1 transition-colors',
                                  'bg-white dark:bg-zinc-800',
                                  'hover:bg-blue-100 dark:hover:bg-blue-950',
                                  'data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600',
                                  'border-gray-300 dark:border-zinc-700'
                                )}
                              >
                                {type}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Workplace</h3>
                  <FormField
                    control={form.control}
                    name="workplace"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="w-full"
                          >
                            {['On-site','Remote','Hybrid'].map((type) => (
                              <ToggleGroupItem
                                key={type}
                                value={type}
                                className={cn(
                                  'border rounded-md px-4 py-2 mx-1 my-1 transition-colors',
                                  'bg-white dark:bg-zinc-800',
                                  'hover:bg-blue-100 dark:hover:bg-blue-950',
                                  'data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600',
                                  'border-gray-300 dark:border-zinc-700'
                                )}
                              >
                                {type}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Screening Questions</h3>
                  <FormField
                    control={form.control}
                    name="screeningquestions"
                    render={() => (
                      <FormItem className="w-full">
                        <ScreeningQuestions
                          value={screeningQuestions}
                          onChange={(updated) => setValue("screeningquestions", updated)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-8">
                <Button type="button" variant="outline" onClick={goBack} className="w-32">Back</Button>
                <Button type="submit" className="w-32">{isEditing ? 'Update Job' : 'Post Job'}</Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </Card>
  )
  
}
import z from "zod";

export const postSchema = z.object({
  title: z.string().min(1, {message: "Please enter Job title.",}),
  company:z.string().min(1,{message:"Please enter Company name"}),
  location:z.string().min(1,{message:"Please enter Job location"}),
  jobtype:z.string().min(1,{message:"Please enter Job type"}),
  workplace:z.string().min(1,{message:"Please enter Workplace"}),
  openings:z.coerce.number(),
  screeningquestions: z.array(z.object({ question: z.string().min(1) })).max(3),
})
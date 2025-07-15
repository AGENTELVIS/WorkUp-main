import  createClerkSupabaseClient from '../../app/supabase/supabasecClient'
import { Button } from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from'@/components/ui/form'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { Plus } from 'lucide-react'

const companySchema = z.object({
  companyname: z.string().min(1, { message: 'Please enter company name' }),
  companylogo: z
    .any()
    .refine((file) => file?.length === 1, { message: "Logo is required" })
    .refine((file) => file?.[0]?.type?.startsWith("image/"), { message: "File must be an image" }),
});

const CompanyDialog = () => {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient()

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyname: "",
      companylogo: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof companySchema>) {
    console.log("Form Submitted", values);

    try {
      if (!user) throw new Error("User not found");
      
      const file = values.companylogo[0];
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('companylogo')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase
        .storage
        .from('companylogo')
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL");

      const { error: insertError } = await supabase
        .from('companies')
        .insert({
          companyname: values.companyname,
          companylogo: publicUrl,
          user_id: user?.id,
        });

      if (insertError) throw insertError;

      alert("✅ Company added!");
      form.reset();
    } catch (err) {
      console.error("Submission error:", err);
      alert("❌ Something went wrong. Check console.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>

        {/* ✅ Move Form wrapper here inside DialogContent */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companylogo"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Company logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Company</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDialog;
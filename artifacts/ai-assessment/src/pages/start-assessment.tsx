import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAssessment } from "@workspace/api-client-react";
import { Building2, Globe2, Briefcase, Users, Loader2 } from "lucide-react";

const formSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.enum(["startup", "small", "medium", "large", "enterprise"], {
    required_error: "Please select a company size"
  }),
  geography: z.string().min(1, "Please select a geography"),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const industries = [
  "Financial Services", "Healthcare", "Technology", "Manufacturing", 
  "Retail", "Education", "Government", "Energy", "Telecommunications", 
  "Transportation", "Media & Entertainment", "Professional Services", 
  "Real Estate", "Consumer Goods", "Other"
];

const geographies = [
  "North America", "Europe", "Asia Pacific", "Latin America", 
  "Middle East", "Africa", "Global"
];

export default function StartAssessment() {
  const [, setLocation] = useLocation();
  const createAssessment = useCreateAssessment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      industry: "",
      companySize: undefined,
      geography: "",
      contactName: "",
      contactEmail: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createAssessment.mutate({ data: values }, {
      onSuccess: (data) => {
        setLocation(`/assess/${data.id}`);
      }
    });
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Organization Profile</h1>
          <p className="text-muted-foreground text-lg">
            Let's start by understanding your organization's context to provide tailored benchmarks.
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-border/40 pb-4">
            <CardTitle>Company Details</CardTitle>
            <CardDescription>This information helps calibrate your assessment results against industry peers.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Acme Corp" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="pl-10 relative">
                              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map(ind => (
                              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="pl-10 relative">
                              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="startup">Startup (1-50)</SelectItem>
                            <SelectItem value="small">Small (51-200)</SelectItem>
                            <SelectItem value="medium">Medium (201-1000)</SelectItem>
                            <SelectItem value="large">Large (1001-5000)</SelectItem>
                            <SelectItem value="enterprise">Enterprise (5000+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="geography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Geography</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="pl-10 relative">
                            <Globe2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {geographies.map(geo => (
                            <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-border/40">
                  <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">Contact Info (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="jane@acmecorp.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto min-w-[200px]"
                    disabled={createAssessment.isPending}
                  >
                    {createAssessment.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                    ) : (
                      "Begin Assessment"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

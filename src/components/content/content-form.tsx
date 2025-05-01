"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Globe, Image, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const contentFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  scheduledDate: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

const defaultValues: Partial<ContentFormValues> = {
  title: "",
  content: "",
  scheduledDate: "",
  platforms: [],
  featuredImage: "",
};

interface ContentFormProps {
  initialValues?: Partial<ContentFormValues>;
  onSubmit?: (data: ContentFormValues) => void;
}

export function ContentForm({ initialValues, onSubmit }: ContentFormProps) {
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialValues || defaultValues,
  });

  function handleSubmit(data: ContentFormValues) {
    onSubmit?.(data);
    console.log("Content submitted:", data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <TabsContent value="editor" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your content title" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be the headline of your newsletter.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input placeholder="Image URL or upload" {...field} />
                          <Button type="button" variant="outline" size="icon">
                            <Image className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add a featured image to your content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main content of your newsletter.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="datetime-local" {...field} />
                          <Button type="button" variant="outline" size="icon">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Schedule when this content should be published.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="platforms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distribution Platforms</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {["Email", "Twitter", "LinkedIn", "Facebook", "Instagram"].map((platform) => (
                            <Button 
                              key={platform}
                              type="button" 
                              variant={field.value?.includes(platform) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const currentValues = field.value || [];
                                const newValues = currentValues.includes(platform)
                                  ? currentValues.filter(p => p !== platform)
                                  : [...currentValues, platform];
                                field.onChange(newValues);
                              }}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              {platform}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select which platforms to publish this content to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <CardFooter className="px-0 flex justify-between">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TemplateEditor } from "@/components/editor/TemplateEditor";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

interface NewTemplate {
  name: string;
  description: string;
  content: string;
  category: 'email' | 'social' | 'blog';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [template, setTemplate] = useState<NewTemplate>({
    name: "",
    description: "",
    content: "",
    category: "email",
    status: "DRAFT",
  });

  const handleSave = async () => {
    if (!organization?.id) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/campaign-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          content: template.content,
          status: template.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      router.push(`/templates/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">New Template</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={template.category}
                  onValueChange={(value: 'email' | 'social' | 'blog') => setTemplate({ ...template, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <TemplateEditor
                  value={template.content}
                  onChange={(value) => setTemplate({ ...template, content: value })}
                  type={template.category}
                  organizationId={organization?.id || ''}
                  placeholder="Start writing your template..."
                />
              </TabsContent>
              <TabsContent value="preview">
                <div
                  className="prose max-w-none p-4 border rounded-lg min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: template.content }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

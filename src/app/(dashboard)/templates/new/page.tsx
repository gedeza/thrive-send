"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateCategory, TemplateStatus, Template } from "../templates.mock-data";

const defaultCategories: TemplateCategory[] = ["Email", "Social Media", "Form", "Blog", "Notification"];
const defaultStatuses: TemplateStatus[] = ["draft", "published", "archived"];

export default function NewTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Template, "id" | "lastUpdated">>({
    name: "",
    category: "Email",
    status: "draft",
    author: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new mock template object, generate random id
    const id = Math.floor(Math.random() * 1000000).toString();
    // Here, normally we'd persist data; we'll just mock
    // Optionally, you can persist to localStorage for demo
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("templates") || "[]");
      const newTemplate = {
        ...form,
        id,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("templates", JSON.stringify([...existing, newTemplate]));
    }
    router.push(`/templates/editor/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input w-full">
                {defaultCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input w-full">
                {defaultStatuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <Input name="author" value={form.author} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                Create Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

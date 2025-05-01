import { ContentForm } from "@/components/content/content-form";

export default function NewContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Content</h1>
      <ContentForm />
    </div>
  );
}
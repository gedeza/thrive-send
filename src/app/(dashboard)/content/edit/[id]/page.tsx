"use client";

import { notFound, useRouter } from "next/navigation";
import ContentForm from "@/components/content/ContentForm";
import { contentItems } from "../content.mock-data";

export default function EditContentPage({ params }: { params: { id: string } }) {
  const item = contentItems.find(c => c.id === params.id);
  const router = useRouter();

  if (!item) return notFound();

  // Map item props to ContentForm's expected structure
  const initialFormData = {
    title: item.title,
    contentType: item.type === "Image" ? "html" : "html", // Adapt as needed
    tags: item.tags,
    content: "",     // You may extend mock-data with 'content' field for pre-fill
    preheaderText: "",
    mediaFiles: [],
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Content</h1>
        <p className="text-muted-foreground">
          Update content and assets for your marketing campaigns.
        </p>
      </div>
      <ContentForm
        initialFormData={initialFormData}
        onSubmitSuccess={() => router.push("/content")}
        isEditing
      />
    </div>
  );
}
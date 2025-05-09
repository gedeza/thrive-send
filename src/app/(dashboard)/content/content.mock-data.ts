export type ContentType = "Email Copy" | "Social Media" | "Image" | "Landing Page" | "Snippet" | "Blog Post" | "Video";
export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  lastModified: string; // iso date
  status: "draft" | "published" | "archived";
  tags: string[];
  author: string;
}

export const contentItems: ContentItem[] = [
  {
    id: "1",
    title: "Product Benefits",
    type: "Email Copy",
    lastModified: "2023-06-12",
    status: "published",
    tags: ["marketing", "promotion"],
    author: "Alice Johnson",
  },
  {
    id: "2",
    title: "Customer Testimonials",
    type: "Social Media",
    lastModified: "2023-06-05",
    status: "draft",
    tags: ["social", "testimonials"],
    author: "Bob Lee",
  },
  {
    id: "3",
    title: "Summer Sale Banner",
    type: "Image",
    lastModified: "2023-05-28",
    status: "archived",
    tags: ["design", "promotion"],
    author: "Kris Moore",
  },
  {
    id: "4",
    title: "How to Boost Deliverability",
    type: "Blog Post",
    lastModified: "2023-04-21",
    status: "published",
    tags: ["guide", "email"],
    author: "Dana West",
  }
];
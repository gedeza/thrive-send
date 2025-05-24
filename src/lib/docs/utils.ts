import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DocPage {
  title: string;
  description: string;
  content: string;
  slug: string;
}

const docsDirectory = path.join(process.cwd(), "docs/user-guides");

export async function getDocPage(slug: string): Promise<DocPage> {
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    title: data.title,
    description: data.description,
    content,
    slug,
  };
}

export async function getAllDocPages(): Promise<DocPage[]> {
  const fileNames = fs.readdirSync(docsDirectory);
  const markdownFiles = fileNames.filter(fileName => fileName.endsWith('.md'));
  
  const pages = await Promise.all(
    markdownFiles.map(async fileName => {
      const slug = fileName.replace(/\.md$/, '');
      return getDocPage(slug);
    })
  );

  return pages;
} 
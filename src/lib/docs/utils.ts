import fs from "fs";
import path from "path";

export interface DocPage {
  title: string;
  description: string;
  content: string;
  slug: string;
}

// Simple frontmatter parser without gray-matter dependency
function parseFrontmatter(content: string): { data: any; content: string } {
  const lines = content.split('\n');
  let frontmatterEnd = -1;
  let data = {};

  // Check if content starts with frontmatter
  if (lines[0] === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontmatterEnd = i;
        break;
      }
    }
  }

  if (frontmatterEnd > 0) {
    const frontmatterLines = lines.slice(1, frontmatterEnd);
    for (const line of frontmatterLines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        data[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }
    const markdownContent = lines.slice(frontmatterEnd + 1).join('\n');
    return { data, content: markdownContent };
  }

  return { data: {}, content };
}

export function getDocPage(slug: string): DocPage | null {
  try {
    const docsDirectory = path.join(process.cwd(), "src/content/docs");
    const filePath = path.join(docsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = parseFrontmatter(fileContent);
    
    return {
      title: data.title || slug,
      description: data.description || "",
      content,
      slug,
    };
  } catch (error) {
    console.error("Error reading doc page:", error);
    return null;
  }
}

export function getAllDocSlugs(): string[] {
  try {
    const docsDirectory = path.join(process.cwd(), "src/content/docs");
    
    if (!fs.existsSync(docsDirectory)) {
      return [];
    }
    
    const files = fs.readdirSync(docsDirectory);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    console.error("Error reading docs directory:", error);
    return [];
  }
}
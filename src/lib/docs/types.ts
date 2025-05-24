export interface DocPage {
    title: string;
    description: string;
    content: string;
    slug: string;
  }
  
export interface DocSection {
  title: string;
  slug: string;
  subsections?: DocSection[];
}
  
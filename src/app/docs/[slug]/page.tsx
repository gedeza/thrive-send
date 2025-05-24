import { DocumentationViewer } from '@/components/documentation/DocumentationViewer';
import { getDocPage } from '@/lib/docs/utils';
import { DocumentationNav } from '@/components/documentation/DocumentationNav';
import { notFound } from 'next/navigation';

interface DocsPageProps {
  params: {
    slug: string;
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  try {
    const page = await getDocPage(params.slug);
    
    return (
      <div className="flex min-h-screen">
        <DocumentationNav sections={[
          { title: 'Getting Started', slug: 'getting-started' },
          { title: 'Campaign Management', slug: 'campaign-management' },
          { title: 'Content Management', slug: 'content-management' },
          { title: 'Analytics', slug: 'analytics' },
          { title: 'User Management', slug: 'user-management' }
        ]} />
        <main className="flex-1">
          <DocumentationViewer page={page} />
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
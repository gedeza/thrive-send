import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX } from 'lucide-react';

export default function ContentNotFound() {
  return (
    <div className="container mx-auto py-16">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-muted-foreground">
            The content you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content
            </Link>
          </Button>
          <Button asChild>
            <Link href="/content/new">
              Create New Content
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
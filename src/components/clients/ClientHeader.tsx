import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Globe, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface ClientHeaderProps {
  client: {
    id: string;
    name: string;
    industry?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export default function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <Card className="card-enhanced border-l-2 border-primary/20 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{client.name}</h1>
          {client.industry && (
            <p className="text-muted-foreground">{client.industry}</p>
          )}
          
          <div className="mt-4 space-y-2">
            {client.website && (
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <div className="p-1 bg-primary/10 rounded border border-primary/20">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {client.website}
                </a>
              </div>
            )}
            
            {client.email && (
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <div className="p-1 bg-primary/10 rounded border border-primary/20">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={`mailto:${client.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {client.email}
                </a>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <div className="p-1 bg-primary/10 rounded border border-primary/20">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={`tel:${client.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {client.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ClientHeaderSkeleton() {
  return (
    <Card className="card-enhanced border-l-2 border-muted/20 p-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
          
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <Skeleton className="h-9 w-28" />
      </div>
    </Card>
  );
} 
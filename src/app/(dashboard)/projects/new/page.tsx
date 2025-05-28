"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";

interface Client {
  id: string;
  name: string;
  organizationId: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!organization?.id) {
          throw new Error('No organization selected');
        }

        setIsLoading(true);
        setError(null);
        
        // Use the Clerk organization ID
        const response = await fetch(`/api/clients?organizationId=${organization.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch clients');
        }

        const data = await response.json();
        setClients(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load clients';
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOrgLoaded && organization?.id) {
      fetchClients();
    }
  }, [isOrgLoaded, organization?.id, toast]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const handleContinue = () => {
    if (selectedClient) {
      router.push(`/clients/${selectedClient}/projects/new`);
    }
  };

  if (!isOrgLoaded || !organization) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              onClick={() => router.refresh()}
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Clients Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to create a client before creating a project.</p>
            <Button 
              onClick={() => router.push('/clients/new')}
              className="w-full"
            >
              Create a Client First
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Select a Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientSelect">Projects must be associated with a client</Label>
            <Select onValueChange={handleClientSelect}>
              <SelectTrigger id="clientSelect">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedClient}
            >
              Continue
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => router.push('/clients/new')}
            >
              Create a new client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

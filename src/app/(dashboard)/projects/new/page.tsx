"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample client data - replace with actual API call
  const clients = [
    { id: '1', name: 'Acme Corporation' },
    { id: '2', name: 'Tech Innovations Inc.' },
    { id: '3', name: 'Global Marketing Group' }
  ];

  // Simulate checking if we have clients
  useEffect(() => {
    // In a real app, this would fetch clients from an API
    const fetchClients = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const handleContinue = () => {
    if (selectedClient) {
      router.push(`/clients/${selectedClient}/projects/new`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  // If no clients exist, show a message and option to create a client first
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

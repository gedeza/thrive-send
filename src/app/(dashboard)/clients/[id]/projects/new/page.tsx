"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function NewProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch client data based on the ID
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Mock client data - replace with actual data fetching
        setClientData({
          id: params.id,
          name: params.id === '1' ? 'Acme Corporation' : 
                params.id === '2' ? 'Tech Innovations Inc.' : 
                params.id === '3' ? 'Global Marketing Group' : `Client ${params.id}`
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching client:', error);
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Replace with actual API call to create project
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading client information...</p>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The client you&apos;re trying to create a project for doesn&apos;t exist.</p>
            <Button 
              onClick={() => router.push('/clients')}
              className="w-full"
            >
              Go to Clients
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
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Client:</p>
            <p className="text-lg font-bold">{clientData.name}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input 
                id="projectName" 
                placeholder="Enter project name" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectStatus">Status</Label>
              <Select>
                <SelectTrigger id="projectStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea 
                id="projectDescription" 
                placeholder="Describe your project" 
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

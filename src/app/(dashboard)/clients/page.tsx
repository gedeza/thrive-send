"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

// Mock client data (will be replaced with actual data from the database)
const clients = [
  {
    id: "1",
    name: "Metro City Government",
    email: "contact@metrocity.gov",
    type: "MUNICIPALITY",
    status: "active"
  },
  {
    id: "2",
    name: "TechSpark Innovations",
    email: "info@techspark.com",
    type: "BUSINESS",
    status: "active"
  },
  {
    id: "3",
    name: "GreenLife Nonprofit",
    email: "hello@greenlife.org",
    type: "NONPROFIT",
    status: "inactive"
  },
  {
    id: "4",
    name: "Sarah's Lifestyle Blog",
    email: "sarah@lifestyle.blog",
    type: "INDIVIDUAL",
    status: "active"
  },
  {
    id: "5",
    name: "RapidGrowth Startup",
    email: "team@rapidgrowth.io",
    type: "STARTUP",
    status: "active"
  }
];

export default function ClientsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <Button asChild className="flex items-center gap-1">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
            </div>
            
            {clients.map((client) => (
              <div key={client.id} className="grid grid-cols-12 p-3 text-sm border-t">
                <div className="col-span-4 font-medium">
                  <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline">
                    {client.name}
                  </Link>
                </div>
                <div className="col-span-4">{client.email}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                    {client.type}
                  </span>
                </div>
                <div className="col-span-2">
                  <span 
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

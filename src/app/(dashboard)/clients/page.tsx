"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Globe, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { clients, type Client } from "./clients.mock-data";

// Maps for icons and styling
const typeBadge = {
  MUNICIPALITY: "bg-yellow-100 text-yellow-800",
  BUSINESS: "bg-blue-100 text-blue-800",
  STARTUP: "bg-purple-100 text-purple-800",
  INDIVIDUAL: "bg-pink-100 text-pink-800",
  NONPROFIT: "bg-green-100 text-green-800"
} as const;

const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-4 w-4" />,
  TWITTER: <Twitter className="h-4 w-4" />,
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />
};

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
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Email / Socials</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Industry</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">More</div>
            </div>
            
            {clients.map((client) => (
              <div key={client.id} className="grid grid-cols-12 p-3 text-sm border-t items-center">
                <div className="col-span-3 font-medium">
                  <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                    {client.logoUrl && (
                      <img src={client.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover border mr-2 inline-block" />
                    )}
                    {client.name}
                  </Link>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-500" />{client.email}
                  </span>
                  <span className="flex items-center gap-2">
                    {client.socialAccounts.map(a => (
                      <a 
                        key={a.id} 
                        href={a.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title={a.platform}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {platformIconMap[a.platform] || a.platform.charAt(0)}
                      </a>
                    ))}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge[client.type as keyof typeof typeBadge]}`}>
                    {client.type}
                  </span>
                </div>
                <div className="col-span-2">{client.industry || "—"}</div>
                <div className="col-span-1">
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
                <div className="col-span-1 flex gap-2">
                  {client.website && (
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 text-blue-500">
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  <Link href={`/clients/${client.id}`} className="text-xs text-blue-600 hover:underline">Details</Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

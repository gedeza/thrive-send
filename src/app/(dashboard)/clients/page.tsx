"use client"

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Globe, Facebook, Twitter, Instagram, Linkedin, Mail, User } from "lucide-react";
import { clients as mockClients, type Client } from "./clients.mock-data";

// Badge coloring for client types
const typeBadge = {
  MUNICIPALITY: "bg-yellow-100 text-yellow-800",
  BUSINESS: "bg-blue-100 text-blue-800",
  STARTUP: "bg-purple-100 text-purple-800",
  INDIVIDUAL: "bg-pink-100 text-pink-800",
  NONPROFIT: "bg-green-100 text-green-800"
} as const;

// Icon mapping for social platforms
const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-4 w-4" />,
  TWITTER: <Twitter className="h-4 w-4" />,
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />
};

function getInitials(name: string) {
  const words = name.split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  try {
    // Use a fixed locale for consistent SSR/CSR output!
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  // For large datasets, memoization prevents unnecessary filtering
  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockClients;
    return mockClients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }, [search]);

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
      
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full sm:max-w-xs rounded-md border px-3 py-2 text-sm shadow-sm"
          aria-label="Search clients"
        />
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
            
            {/* Empty State Display */}
            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="flex justify-center mb-2">
                  <Users className="h-10 w-10 opacity-30" />
                </div>
                <div className="mb-2 font-semibold">No clients found</div>
                <div className="text-sm">Try adjusting your search or <Link href="/clients/new" className="underline text-blue-500">add a new client</Link>.</div>
              </div>
            )}
            
            {filteredClients.map((client) => (
              <div key={client.id} className="grid grid-cols-12 p-3 text-sm border-t items-center">
                <div className="col-span-3 font-medium">
                  <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                    {client.logoUrl ? (
                      <img
                        src={client.logoUrl}
                        alt={`Logo for ${client.name}`}
                        className="w-8 h-8 rounded-full object-cover border mr-2"
                      />
                    ) : (
                      <span
                        className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-200 text-gray-800 border font-bold text-base"
                        aria-label={`Avatar for ${client.name}`}
                        title={client.name}
                      >
                        {getInitials(client.name)}
                      </span>
                    )}
                    {client.name}
                  </Link>
                  <div className="text-xs text-gray-500">{formatDate(client.createdAt)}</div>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{client.email}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {client.socialAccounts.map(a => (
                      <a 
                        key={a.id} 
                        href={
                          a.platform === "FACEBOOK"
                          ? `https://facebook.com/${a.handle.replace(/^@|^\/+/, "")}`
                          : a.platform === "TWITTER"
                          ? `https://twitter.com/${a.handle.replace(/^@/, "")}`
                          : a.platform === "INSTAGRAM"
                      ? `https://instagram.com/${a.handle.replace(/^@/, "")}`
                          : a.platform === "LINKEDIN"
                          ? `https://linkedin.com${a.handle.startsWith("/") ? "" : "/"}${a.handle}`
                          : "#"
                        }
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title={a.platform}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {platformIconMap[a.platform] || <User className="h-4 w-4" />}
                      </a>
                    ))}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge[client.type as keyof typeof typeBadge]}`}>
                    {client.type.charAt(0) + client.type.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="col-span-2">{client.industry || "—"}</div>
                <div className="col-span-1">
                  <span 
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : client.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-1 flex gap-2">
                  {client.website && (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-700 text-blue-500"
                      title="Visit website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  <Link href={`/clients/${client.id}`} className="text-xs text-blue-600 hover:underline">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

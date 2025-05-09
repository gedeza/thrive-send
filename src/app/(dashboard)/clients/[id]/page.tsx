import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
export const metadata: Metadata = {
  title: "Client Details | ThriveSend",
  description: "View client details and manage their projects",
};

// Mock data for clients
const clients = [
  {
    id: "1",
    name: "Metro City Government",
    type: "MUNICIPALITY",
    industry: "Government",
    website: "https://metrocity.gov",
    logoUrl: "https://placehold.co/400",
    createdAt: "2023-01-15T00:00:00.000Z",
    socialAccounts: [
      { id: "1", platform: "FACEBOOK", handle: "@MetroCityGov" },
      { id: "2", platform: "TWITTER", handle: "@MetroCityGov" },
      { id: "3", platform: "INSTAGRAM", handle: "@metrocitygov" }
    ],
    projects: [
      { id: "1", name: "Summer Events Campaign", status: "ACTIVE" },
      { id: "2", name: "Citizen Engagement Initiative", status: "PLANNED" },
      { id: "3", name: "Annual Report Distribution", status: "COMPLETED" }
    ]
  },
  {
    id: "2",
    name: "TechNova Solutions",
    type: "CORPORATE",
    industry: "Technology",
    website: "https://technova.com",
    logoUrl: "https://placehold.co/400/blue/white",
    createdAt: "2022-11-05T00:00:00.000Z",
    socialAccounts: [
      { id: "4", platform: "LINKEDIN", handle: "@technovasolutions" },
      { id: "5", platform: "TWITTER", handle: "@TechNovaSol" }
    ],
    projects: [
      { id: "4", name: "Product Launch Campaign", status: "ACTIVE" },
      { id: "5", name: "Developer Conference", status: "PLANNED" }
    ]
  }
];

// Map of social platform icons
const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-5 w-5" />,
  TWITTER: <Twitter className="h-5 w-5" />,
  INSTAGRAM: <Instagram className="h-5 w-5" />,
  LINKEDIN: <Linkedin className="h-5 w-5" />,
};

// Function to get client by ID
function getClientById(id: string) {
  return clients.find(c => c.id === id);
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = getClientById(params.id);
  
  if (!client) return notFound();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">
            {client.type} • {client.industry}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            Edit Client
          </Link>
          <Link
            href="/clients"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Back to Clients
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Client Info Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Client Information</h2>
              <div className="w-full h-40 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
              {client.logoUrl ? (
                <Image
                  src={client.logoUrl}
                    alt={`${client.name} logo`}
                      width={400}
                        height={160}
                          className="w-full h-full object-cover"
                           priority
                        />
                       ) : (
                      <span className="text-gray-400">No logo</span>
                 )}
            </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Type:</div>
                <div className="text-sm">{client.type}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Industry:</div>
                <div className="text-sm">{client.industry}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Website:</div>
                <div className="text-sm">
                  {client.website ? (
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Visit Site
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Client Since:</div>
                <div className="text-sm">
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Accounts Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Social Accounts</h2>
              <Link
                href={`/clients/${client.id}/social-accounts/new`}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
              >
                Add Account
              </Link>
            </div>
            
            {client.socialAccounts.length > 0 ? (
              <div className="space-y-3">
                {client.socialAccounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-3 p-3 rounded-md border">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {platformIconMap[account.platform] || account.platform.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{account.platform}</div>
                      <div className="text-sm text-muted-foreground">{account.handle}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No social accounts connected yet.
              </div>
            )}
          </div>
        </div>

        {/* Projects Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
              <Link
                href={`/clients/${client.id}/projects/new`}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
              >
                New Project
              </Link>
            </div>
            
            {client.projects.length > 0 ? (
              <div className="space-y-3">
                {client.projects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`} 
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent"
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      project.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No projects created yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Analytics Placeholder */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Content Analytics</h2>
          <div className="h-64 flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">Analytics dashboard will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

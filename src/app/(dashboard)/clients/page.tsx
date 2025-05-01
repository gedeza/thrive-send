import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients | ThriveSend",
  description: "Manage your clients in ThriveSend",
};

// Mock client data (will be replaced with actual data from the database)
const clients = [
  {
    id: "1",
    name: "Metro City Government",
    type: "MUNICIPALITY",
    industry: "Government",
    projects: 3,
    createdAt: "2023-01-15T00:00:00.000Z"
  },
  {
    id: "2",
    name: "TechSpark Innovations",
    type: "BUSINESS",
    industry: "Technology",
    projects: 2,
    createdAt: "2023-02-20T00:00:00.000Z"
  },
  {
    id: "3",
    name: "GreenLife Nonprofit",
    type: "NONPROFIT",
    industry: "Environmental",
    projects: 1,
    createdAt: "2023-03-10T00:00:00.000Z"
  },
  {
    id: "4",
    name: "Sarah's Lifestyle Blog",
    type: "INDIVIDUAL",
    industry: "Lifestyle",
    projects: 1,
    createdAt: "2023-04-05T00:00:00.000Z"
  },
  {
    id: "5",
    name: "RapidGrowth Startup",
    type: "STARTUP",
    industry: "Finance",
    projects: 2,
    createdAt: "2023-05-12T00:00:00.000Z"
  }
];

// Helper to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client list and their details
          </p>
        </div>
        <Link
          href="/clients/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Client
        </Link>
      </div>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Type
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Industry
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Projects
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Created
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {clients.map((client) => (
                <tr 
                  key={client.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <Link 
                      href={`/clients/${client.id}`} 
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {client.type}
                    </span>
                  </td>
                  <td className="p-4 align-middle">{client.industry}</td>
                  <td className="p-4 align-middle">{client.projects}</td>
                  <td className="p-4 align-middle">{formatDate(client.createdAt)}</td>
                  <td className="p-4 align-middle">
                    <div className="flex space-x-2">
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                      >
                        Edit
                      </Link>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
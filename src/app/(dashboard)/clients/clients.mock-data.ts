export type ClientType = "MUNICIPALITY" | "BUSINESS" | "STARTUP" | "INDIVIDUAL" | "NONPROFIT";
export type ClientStatus = "active" | "inactive";

export interface SocialAccount {
  id: string;
  platform: "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "LINKEDIN";
  handle: string;
}

export interface Project {
  id: string;
  name: string;
  status: "ACTIVE" | "PLANNED" | "COMPLETED";
}

export interface Client {
  id: string;
  name: string;
  email: string;
  type: ClientType;
  status: ClientStatus;
  industry: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
  socialAccounts: SocialAccount[];
  projects: Project[];
}

export const clients: Client[] = [
  {
    id: "1",
    name: "Metro City Government",
    email: "contact@metrocity.gov",
    type: "MUNICIPALITY",
    status: "active",
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
    name: "TechSpark Innovations",
    email: "info@techspark.com",
    type: "BUSINESS",
    status: "active",
    industry: "Technology",
    website: "https://techspark.com",
    logoUrl: "https://placehold.co/400",
    createdAt: "2022-11-21T00:00:00.000Z",
    socialAccounts: [
      { id: "4", platform: "LINKEDIN", handle: "/company/techspark" },
      { id: "5", platform: "TWITTER", handle: "@techspark" }
    ],
    projects: [
      { id: "4", name: "Product Launch", status: "COMPLETED" },
      { id: "5", name: "Growth Hacking Plan", status: "ACTIVE" }
    ]
  },
  {
    id: "3",
    name: "GreenLife Nonprofit",
    email: "hello@greenlife.org",
    type: "NONPROFIT",
    status: "inactive",
    industry: "Nonprofit",
    website: undefined,
    logoUrl: undefined,
    createdAt: "2021-09-10T00:00:00.000Z",
    socialAccounts: [{ id: "6", platform: "FACEBOOK", handle: "/GreenLifeNP" }],
    projects: []
  },
  {
    id: "4",
    name: "Sarah's Lifestyle Blog",
    email: "sarah@lifestyle.blog",
    type: "INDIVIDUAL",
    status: "active",
    industry: "Blogging",
    website: "https://lifestyle.blog",
    logoUrl: "https://placehold.co/400",
    createdAt: "2024-02-11T00:00:00.000Z",
    socialAccounts: [
      { id: "7", platform: "INSTAGRAM", handle: "@sarahsblog" }
    ],
    projects: [{ id: "7", name: "Sponsored Content Partnership", status: "PLANNED" }]
  },
  {
    id: "5",
    name: "RapidGrowth Startup",
    email: "team@rapidgrowth.io",
    type: "STARTUP",
    status: "active",
    industry: "Startup",
    website: "https://rapidgrowth.io",
    logoUrl: "https://placehold.co/400",
    createdAt: "2023-07-29T00:00:00.000Z",
    socialAccounts: [
      { id: "8", platform: "LINKEDIN", handle: "/company/rapidgrowth" }
    ],
    projects: []
  }
];
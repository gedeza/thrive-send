import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Client | ThriveSend",
  description: "Add a new client to ThriveSend",
};

export default function NewClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
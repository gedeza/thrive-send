import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Details | ThriveSend",
  description: "View client details and manage their projects",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
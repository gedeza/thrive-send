import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Content | ThriveSend',
  description: 'Create and schedule new content for your email marketing campaigns'
};

export default function NewContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
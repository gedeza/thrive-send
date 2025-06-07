import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ThriveSend - Amplify Your Social Media Presence',
  description: 'ThriveSend helps enterprises, businesses, and content creators drive engagement, build stronger communities, and monetize their expertise.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-layout">
      {children}
    </div>
  );
}

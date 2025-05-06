import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

// Using Inter font for consistent typography
const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        <div className="landing-layout">
          {children}
        </div>
      </body>
    </html>
  );
}

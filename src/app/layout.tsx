import '../../styles/global-fonts.css';
import "./globals.css";
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'ThriveSend',
  description: 'Social media management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

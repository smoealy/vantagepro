import type { Metadata } from 'next';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: "Vantage Pro Studio",
  description: "Enterprise-grade Multi-Agent Product Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const resolvedPublishableKey =
    clerkPublishableKey ?? "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";
  const content = <ClerkProvider publishableKey={resolvedPublishableKey}>{children}</ClerkProvider>;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {content}
      </body>
    </html>
  );
}

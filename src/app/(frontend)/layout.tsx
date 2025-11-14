import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import React from 'react';
import '../globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={(cn(GeistSans.variable, GeistMono.variable), 'h-full')} lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}

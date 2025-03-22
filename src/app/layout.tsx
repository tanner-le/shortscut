import React from 'react';
import './globals.css';
import { Providers } from '@/store/Providers';

export const metadata = {
  title: 'Shortscut - Content Agency Portal',
  description: 'Manage your clients and contracts in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

'use client';

import AuthHeader from '@/components/auth/AuthHeader';
import { ReactNode } from 'react';

// Client component that wraps the client AuthHeader
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
} 
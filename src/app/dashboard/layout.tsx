import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | Shortscut',
  description: 'Your Shortscut dashboard',
};

export default function DashboardPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 
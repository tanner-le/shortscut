import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Dashboard | Shortscut',
  description: 'Shortscut Admin Dashboard',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 
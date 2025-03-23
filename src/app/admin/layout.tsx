import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Dashboard | Shortscut',
  description: 'Manage your Shortscut organizations and users',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 
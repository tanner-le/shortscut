import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, we'll simply redirect to the login page
  // Authentication will be handled by the dashboard page
  redirect('/login');
}

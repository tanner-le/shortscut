import { redirect } from 'next/navigation';

export default function Home() {
  // In a real application, we'd check if the user is already authenticated
  // and redirect them to the dashboard if they are
  redirect('/auth/login');
}

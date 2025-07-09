import { redirect } from 'next/navigation';

export default function DashboardRoot() {
  // Redirect to the main dashboard page
  redirect('/dashboard');
}
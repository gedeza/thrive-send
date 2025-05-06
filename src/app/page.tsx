import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root path to the landing page
  redirect('/landing');
}

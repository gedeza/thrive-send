import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from './landing/page';

export default async function Home() {
  const { userId } = await auth();
  
  // If user is not authenticated, show landing page
  if (!userId) {
    return <LandingPage />;
  }
  
  // If user is authenticated, redirect to dashboard
  redirect('/dashboard');
}

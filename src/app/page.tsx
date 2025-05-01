import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">ThriveSend</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <section className="container mx-auto py-24 px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to ThriveSend
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
            The comprehensive social media management platform for digital agencies,
            consultants, and service providers.
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ThriveSend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { Button } from "@/components/ui/button";
import { DocSection } from "@/lib/docs/types";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DocumentationNavProps {
  sections: DocSection[];
}

export function DocumentationNav({ sections }: DocumentationNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSlug = pathname.split('/').pop() || 'getting-started';

  const handleNavigation = (slug: string) => {
    router.push(`/docs/${slug}`);
  };

  return (
    <nav className="w-64 min-h-screen border-r p-4 bg-background">
      <div className="space-y-2">
        {sections.map((section) => (
          <Button
            key={section.slug}
            variant={currentSlug === section.slug ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              currentSlug === section.slug && "bg-secondary"
            )}
            onClick={() => handleNavigation(section.slug)}
          >
            {section.title}
          </Button>
        ))}
      </div>
    </nav>
  );
}
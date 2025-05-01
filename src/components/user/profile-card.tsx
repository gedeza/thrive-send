import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface ProfileCardProps {
  name: string;
  avatarUrl?: string;
  role?: string;
  stats?: {
    label: string;
    value: number | string;
  }[];
  className?: string;
  actions?: React.ReactNode;
}

export function ProfileCard({
  name,
  avatarUrl,
  role,
  stats,
  className,
  actions,
}: ProfileCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="bg-primary/10 h-24 relative" />
      
      <div className="px-4 pb-4">
        <div className="flex flex-col items-center -mt-12">
          <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-background flex items-center justify-center">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={`${name}'s avatar`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mt-2">{name}</h3>
          
          {role && (
            <p className="text-sm text-muted-foreground">{role}</p>
          )}
          
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-lg font-semibold">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          
          {actions && (
            <div className="flex gap-2 mt-4 w-full">
              {actions}
            </div>
          )}
          
          {!actions && (
            <div className="flex gap-2 mt-4 w-full">
              <Button className="flex-1" variant="outline" size="sm">
                Message
              </Button>
              <Button className="flex-1" size="sm">
                Follow
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
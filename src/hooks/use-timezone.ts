import { useUser } from "@clerk/nextjs";
import { DEFAULT_TIMEZONE } from "@/config/timezone";

interface UserMetadata {
  timezone?: string;
}

export function useTimezone() {
  const { user } = useUser();
  const metadata = user?.publicMetadata as UserMetadata | undefined;
  return metadata?.timezone ?? DEFAULT_TIMEZONE;
} 
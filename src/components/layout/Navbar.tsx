import { CustomUserButton } from "@/components/ui/user-button";

export default function Navbar() {
  return (
    <nav>
      {/* ... rest of nav ... */}
      <CustomUserButton afterSignOutUrl="/sign-in" />
    </nav>
  );
}
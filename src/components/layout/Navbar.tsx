import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav>
      {/* ... rest of nav ... */}
      <UserButton afterSignOutUrl="/" />
    </nav>
  );
}
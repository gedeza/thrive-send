import { SettingsLayout } from "@/components/layout/settings-layout";
import { settingsNavigation, SettingsItem } from "@/config/settings-navigation";

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Flatten all navigation items for the sidebar
  const allTabs: SettingsItem[] = Object.values(settingsNavigation).flatMap(section => section.items);

  return (
    <SettingsLayout tabs={allTabs}>
      {children}
    </SettingsLayout>
  );
} 
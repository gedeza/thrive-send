export const settingsNavigation = {
  account: {
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/settings/account/profile',
        description: 'Manage your personal information and preferences'
      },
      {
        id: 'preferences',
        label: 'Preferences',
        href: '/settings/account/preferences',
        description: 'Configure your notification and privacy settings'
      },
      {
        id: 'security',
        label: 'Security',
        href: '/settings/account/security',
        description: 'Manage your account security settings'
      }
    ]
  },
  organization: {
    label: 'Organization',
    items: [
      {
        id: 'general',
        label: 'General',
        href: '/settings/organization/general',
        description: 'Manage your organization\'s basic information'
      },
      {
        id: 'members',
        label: 'Members',
        href: '/settings/organization/members',
        description: 'Manage organization members and roles'
      },
      {
        id: 'billing',
        label: 'Billing',
        href: '/settings/organization/billing',
        description: 'Manage your organization\'s billing and subscription'
      }
    ]
  }
} as const;

export type SettingsNavigation = typeof settingsNavigation;
export type SettingsSection = keyof SettingsNavigation;
export type SettingsItem = SettingsNavigation[SettingsSection]['items'][number]; 
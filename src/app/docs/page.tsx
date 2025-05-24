import Link from 'next/link';

export default function DocsPage() {
  const guides = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of Thrive Send and get up and running quickly.',
      href: '/docs/getting-started',
      icon: '🚀'
    },
    {
      title: 'Campaign Management',
      description: 'Create and manage your marketing campaigns effectively.',
      href: '/docs/campaign-management',
      icon: '📢'
    },
    {
      title: 'Content Management',
      description: 'Master content creation and workflow management.',
      href: '/docs/content-management',
      icon: '📝'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions in your organization.',
      href: '/docs/user-management',
      icon: '👥'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{guide.icon}</span>
              <h2 className="text-xl font-semibold">{guide.title}</h2>
            </div>
            <p className="text-gray-600">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type TabId = 'overview' | 'creation' | 'workflow' | 'analytics';

const ContentManagementGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs = [
    { id: 'overview' as TabId, label: 'Content Overview', icon: '📝' },
    { id: 'creation' as TabId, label: 'Content Creation', icon: '✏️' },
    { id: 'workflow' as TabId, label: 'Workflow', icon: '🔄' },
    { id: 'analytics' as TabId, label: 'Content Analytics', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Content Management Guide</h1>
      
      <div className="mb-10">
        <p className="text-xl text-gray-700">
          Learn how to create, manage, and optimize your content in Thrive Send.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-8 py-4 text-base font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-3 text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Content Overview</h2>
                <div className="text-sm text-gray-500">Content Management</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Content Types</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Email templates</li>
                    <li>• Landing pages</li>
                    <li>• Blog posts</li>
                    <li>• Social media content</li>
                    <li>• Marketing materials</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Content Features</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Rich text editor</li>
                    <li>• Media library</li>
                    <li>• Template system</li>
                    <li>• Version control</li>
                    <li>• Collaboration tools</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h3 className="text-2xl font-semibold mb-4">Content Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Categories</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Marketing</li>
                      <li>• Sales</li>
                      <li>• Support</li>
                      <li>• Product</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-3">Tags</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Campaign type</li>
                      <li>• Target audience</li>
                      <li>• Content format</li>
                      <li>• Status</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-3">Collections</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Campaign series</li>
                      <li>• Product launches</li>
                      <li>• Seasonal content</li>
                      <li>• Brand assets</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creation' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Content Creation</h2>
                <div className="text-sm text-gray-500">Create New Content</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-2xl font-semibold mb-4">Content Setup</h3>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">1. Basic Information</h4>
                    <ol className="space-y-4 text-lg text-gray-700">
                      <li>1. Click "Create Content" button</li>
                      <li>2. Enter content title</li>
                      <li>3. Select content type</li>
                      <li>4. Choose template</li>
                      <li>5. Set content category</li>
                    </ol>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">2. Content Details</h4>
                    <ol className="space-y-4 text-lg text-gray-700">
                      <li>1. Add content description</li>
                      <li>2. Select target audience</li>
                      <li>3. Add relevant tags</li>
                      <li>4. Set content status</li>
                      <li>5. Assign team members</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Content Editor</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Editor Features</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Rich text formatting</li>
                      <li>• Media insertion</li>
                      <li>• Template customization</li>
                      <li>• Personalization tags</li>
                      <li>• Preview mode</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xl font-medium mb-3">Best Practices</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Use clear headings</li>
                      <li>• Optimize images</li>
                      <li>• Check mobile view</li>
                      <li>• Test all links</li>
                      <li>• Review accessibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Content Workflow</h2>
                <div className="text-sm text-gray-500">Manage Content Flow</div>
              </div>

              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src="/docs/images/workflow-management.svg"
                  alt="Content Workflow Management"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-2xl font-semibold mb-4">Workflow Stages</h3>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">Content Lifecycle</h4>
                    <ol className="space-y-4 text-lg text-gray-700">
                      <li>1. Draft: Initial content creation</li>
                      <li>2. Review: Team feedback and edits</li>
                      <li>3. Approval: Manager sign-off</li>
                      <li>4. Published: Live content</li>
                      <li>5. Archived: Historical content</li>
                    </ol>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">Collaboration</h4>
                    <ul className="space-y-4 text-lg text-gray-700">
                      <li>• Assign reviewers</li>
                      <li>• Request feedback</li>
                      <li>• Track changes</li>
                      <li>• Manage approvals</li>
                      <li>• Version control</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Workflow Management</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Automation</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Auto-assign reviewers</li>
                      <li>• Schedule publishing</li>
                      <li>• Set reminders</li>
                      <li>• Trigger notifications</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xl font-medium mb-3">Quality Control</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Content review checklist</li>
                      <li>• Brand compliance check</li>
                      <li>• SEO optimization</li>
                      <li>• Accessibility review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Content Analytics</h2>
                <div className="text-sm text-gray-500">Track Performance</div>
              </div>

              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src="/docs/images/content-analytics.svg"
                  alt="Content Analytics Dashboard"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Performance Metrics</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• View counts</li>
                    <li>• Engagement rates</li>
                    <li>• Conversion rates</li>
                    <li>• Time on page</li>
                    <li>• Bounce rates</li>
                    <li>• Social shares</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Content Insights</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Popular topics</li>
                    <li>• Audience preferences</li>
                    <li>• Content effectiveness</li>
                    <li>• Distribution channels</li>
                    <li>• ROI analysis</li>
                    <li>• Trend analysis</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h3 className="text-2xl font-semibold mb-4">Optimization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Content Strategy</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Identify top performers</li>
                      <li>• Update underperforming content</li>
                      <li>• Optimize for search</li>
                      <li>• Enhance engagement</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-3">Distribution</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Channel optimization</li>
                      <li>• Timing analysis</li>
                      <li>• Audience targeting</li>
                      <li>• Promotion strategy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagementGuide; 
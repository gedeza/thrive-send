'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type TabId = 'overview' | 'account' | 'organization' | 'first-campaign';

const GettingStartedGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs = [
    { id: 'overview' as TabId, label: 'Platform Overview', icon: '🎯' },
    { id: 'account' as TabId, label: 'Account Setup', icon: '👤' },
    { id: 'organization' as TabId, label: 'Organization', icon: '🏢' },
    { id: 'first-campaign' as TabId, label: 'First Campaign', icon: '📢' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Getting Started with Thrive Send</h1>
      
      <div className="mb-10">
        <p className="text-xl text-gray-700">
          Welcome to Thrive Send! This guide will walk you through setting up your account and creating your first campaign.
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
                <h2 className="text-3xl font-semibold">Platform Overview</h2>
                <div className="text-sm text-gray-500">Welcome to Thrive Send</div>
              </div>
              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src="/docs/images/analytics-dashboard-screenshot.png"
                  alt="Analytics Dashboard Screenshot"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Email campaign management</li>
                    <li>• Content creation tools</li>
                    <li>• Analytics dashboard</li>
                    <li>• Team collaboration</li>
                    <li>• Audience segmentation</li>
                    <li>• Automated workflows</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Getting Started</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Create your account</li>
                    <li>• Set up your organization</li>
                    <li>• Invite team members</li>
                    <li>• Create your first campaign</li>
                    <li>• Explore the dashboard</li>
                    <li>• Set up your preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Account Setup</h2>
                <div className="text-sm text-gray-500">Create Your Account</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sign Up Process */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Sign Up Process</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">1. Create Your Account</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Visit <a href="https://app.thrivesend.com/signup" className="text-blue-600 hover:underline">app.thrivesend.com/signup</a></li>
                        <li>2. Enter your email address</li>
                        <li>3. Create a strong password</li>
                        <li>4. Click "Create Account"</li>
                        <li>5. Verify your email address</li>
                      </ol>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">2. Complete Your Profile</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Add your full name</li>
                        <li>2. Upload a profile picture</li>
                        <li>3. Set your timezone</li>
                        <li>4. Choose your notification preferences</li>
                        <li>5. Set up two-factor authentication (recommended)</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Account Settings</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Profile Settings</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Update personal information</li>
                        <li>• Change password</li>
                        <li>• Manage email preferences</li>
                        <li>• Set notification preferences</li>
                        <li>• Configure account settings</li>
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Security Settings</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Two-factor authentication</li>
                        <li>• Session management</li>
                        <li>• Connected devices</li>
                        <li>• Security logs</li>
                        <li>• Access history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Organization Setup</h2>
                <div className="text-sm text-gray-500">Configure Your Workspace</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Organization Setup */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Initial Setup</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">1. Organization Details</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Enter organization name</li>
                        <li>2. Add organization logo</li>
                        <li>3. Set primary contact information</li>
                        <li>4. Choose organization type</li>
                        <li>5. Set business hours</li>
                      </ol>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">2. Branding Setup</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Upload brand assets</li>
                        <li>2. Set brand colors</li>
                        <li>3. Configure email templates</li>
                        <li>4. Set up email signatures</li>
                        <li>5. Create custom domains</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Team Management */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Team Management</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Invite Team Members</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Go to Team Settings</li>
                        <li>2. Click "Invite Members"</li>
                        <li>3. Enter email addresses</li>
                        <li>4. Assign roles and permissions</li>
                        <li>5. Send invitations</li>
                      </ol>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Role Types</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Administrator: Full system access</li>
                        <li>• Manager: Team and campaign management</li>
                        <li>• Editor: Content creation and editing</li>
                        <li>• Viewer: Read-only access</li>
                        <li>• Custom: Tailored permissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'first-campaign' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Create Your First Campaign</h2>
                <div className="text-sm text-gray-500">Campaign Guide</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Campaign Creation */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Campaign Setup</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">1. Campaign Details</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Click "New Campaign"</li>
                        <li>2. Enter campaign name</li>
                        <li>3. Select campaign type</li>
                        <li>4. Choose template or start from scratch</li>
                        <li>5. Set campaign objectives</li>
                      </ol>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">2. Audience Selection</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Choose target audience</li>
                        <li>2. Apply segmentation filters</li>
                        <li>3. Set audience size limits</li>
                        <li>4. Preview audience</li>
                        <li>5. Save audience segment</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Content Creation */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Content Creation</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Email Content</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Write compelling subject line</li>
                        <li>• Design email layout</li>
                        <li>• Add images and media</li>
                        <li>• Include call-to-action buttons</li>
                        <li>• Preview on different devices</li>
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Content Best Practices</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Keep subject lines under 50 characters</li>
                        <li>• Use clear, action-oriented CTAs</li>
                        <li>• Optimize images for email</li>
                        <li>• Test all links before sending</li>
                        <li>• Follow email compliance guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Scheduling */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Schedule & Send</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">Scheduling Options</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Send immediately</li>
                      <li>• Schedule for later</li>
                      <li>• Set up recurring campaigns</li>
                      <li>• Use timezone-based scheduling</li>
                      <li>• A/B test send times</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">Before Sending</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Review campaign settings</li>
                      <li>• Test email rendering</li>
                      <li>• Check spam score</li>
                      <li>• Verify tracking setup</li>
                      <li>• Get approval if required</li>
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

export default GettingStartedGuide; 
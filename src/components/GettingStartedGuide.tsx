'use client';

import React, { useState } from 'react';

type TabId = 'overview' | 'setup' | 'features' | 'next-steps';

const GettingStartedGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: '🎯' },
    { id: 'setup' as TabId, label: 'Setup', icon: '⚙️' },
    { id: 'features' as TabId, label: 'Features', icon: '✨' },
    { id: 'next-steps' as TabId, label: 'Next Steps', icon: '🚀' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Getting Started Guide</h1>
      
      <div className="mb-10">
        <p className="text-xl text-gray-700">
          Welcome to Thrive Send! This guide will help you get started with our platform.
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
                <div className="text-sm text-gray-500">Getting Started</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Campaign Management</li>
                    <li>• Content Creation</li>
                    <li>• Analytics & Reporting</li>
                    <li>• User Management</li>
                    <li>• Team Collaboration</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Getting Started</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Complete your profile</li>
                    <li>• Set up your team</li>
                    <li>• Create your first campaign</li>
                    <li>• Explore features</li>
                    <li>• View tutorials</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Initial Setup</h2>
                <div className="text-sm text-gray-500">Setup Process</div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👤</span>
                      </div>
                      <h3 className="text-xl font-semibold">Profile Setup</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Complete your profile
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Set preferences
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Configure notifications
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="text-xl font-semibold">Team Setup</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Invite team members
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Set roles and permissions
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Configure team settings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Platform Features</h2>
                <div className="text-sm text-gray-500">Key Features</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Campaign Management</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Create and manage campaigns</li>
                    <li>• Schedule content</li>
                    <li>• Track performance</li>
                    <li>• A/B testing</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Content Creation</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Rich text editor</li>
                    <li>• Template system</li>
                    <li>• Media library</li>
                    <li>• Version control</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'next-steps' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Next Steps</h2>
                <div className="text-sm text-gray-500">Getting Started</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Recommended Actions</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Create your first campaign</li>
                    <li>• Set up your team</li>
                    <li>• Configure integrations</li>
                    <li>• Explore analytics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Resources</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Documentation</li>
                    <li>• Video tutorials</li>
                    <li>• Community forum</li>
                    <li>• Support center</li>
                  </ul>
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
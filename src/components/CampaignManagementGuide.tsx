'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type TabId = 'campaigns' | 'creation' | 'scheduling' | 'analytics';

const CampaignManagementGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('campaigns');

  const tabs = [
    { id: 'campaigns' as TabId, label: 'Campaign Types', icon: '📢' },
    { id: 'creation' as TabId, label: 'Campaign Creation', icon: '✏️' },
    { id: 'scheduling' as TabId, label: 'Scheduling', icon: '📅' },
    { id: 'analytics' as TabId, label: 'Campaign Analytics', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Campaign Management Guide</h1>
      
      <div className="mb-10">
        <p className="text-xl text-gray-700">
          Learn how to create, manage, and optimize your email campaigns in Thrive Send.
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
          {activeTab === 'campaigns' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Campaign Types</h2>
                <div className="text-sm text-gray-500">Campaign Overview</div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">📢</span>
                      </div>
                      <h3 className="text-xl font-semibold">Standard Campaigns</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        One-time email sends
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Custom scheduling options
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        A/B testing capabilities
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Detailed performance tracking
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-xl font-semibold">Automated Campaigns</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Trigger-based automation
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Multi-step sequences
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Dynamic content delivery
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Behavioral targeting
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">🎯</span>
                      </div>
                      <h4 className="text-lg font-medium">Engagement</h4>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <div>• Increase open rates</div>
                      <div>• Boost click-through</div>
                      <div>• Drive interactions</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">💰</span>
                      </div>
                      <h4 className="text-lg font-medium">Conversion</h4>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <div>• Drive sales</div>
                      <div>• Generate leads</div>
                      <div>• Increase sign-ups</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl">❤️</span>
                      </div>
                      <h4 className="text-lg font-medium">Retention</h4>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <div>• Reduce churn</div>
                      <div>• Increase loyalty</div>
                      <div>• Boost repeat purchases</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Standard Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• One-time sends</li>
                        <li>• Custom scheduling</li>
                        <li>• A/B testing</li>
                        <li>• Performance tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Product launches</li>
                        <li>• Event promotions</li>
                        <li>• Special offers</li>
                        <li>• Announcements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Automated Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Trigger-based sends</li>
                        <li>• Multi-step sequences</li>
                        <li>• Dynamic content</li>
                        <li>• Behavioral targeting</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Welcome series</li>
                        <li>• Re-engagement</li>
                        <li>• Onboarding</li>
                        <li>• Follow-ups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creation' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Campaign Creation</h2>
                <div className="text-sm text-gray-500">Setup Process</div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">1</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">2</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">3</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">4</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold">Campaign Setup</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Campaign name and description
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Campaign type selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Objective setting
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Basic configuration
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="text-xl font-semibold">Audience Selection</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Target segment selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Exclusion rules setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Audience size preview
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Segment validation
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">✉️</span>
                      </div>
                      <h3 className="text-xl font-semibold">Content Creation</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Email template selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Subject line crafting
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Preview text optimization
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Personalization setup
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <h3 className="text-xl font-semibold">Campaign Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Sender details configuration
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Reply-to address setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Tracking options selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Compliance settings
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Standard Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• One-time sends</li>
                        <li>• Custom scheduling</li>
                        <li>• A/B testing</li>
                        <li>• Performance tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Product launches</li>
                        <li>• Event promotions</li>
                        <li>• Special offers</li>
                        <li>• Announcements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Automated Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Trigger-based sends</li>
                        <li>• Multi-step sequences</li>
                        <li>• Dynamic content</li>
                        <li>• Behavioral targeting</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Welcome series</li>
                        <li>• Re-engagement</li>
                        <li>• Onboarding</li>
                        <li>• Follow-ups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Campaign Scheduling</h2>
                <div className="text-sm text-gray-500">Timing & Delivery</div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📨</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">⏰</span>
                      </div>
                      <h3 className="text-xl font-semibold">Sending Options</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Immediate send option
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Scheduled date selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Time zone configuration
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Best time detection
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">📨</span>
                      </div>
                      <h3 className="text-xl font-semibold">Delivery Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Batch sending configuration
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Throttling options
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Priority level setting
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Retry configuration
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-xl font-semibold">Automation Features</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Trigger condition setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Follow-up rule configuration
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Dynamic timing rules
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Sequence logic setup
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h3 className="text-xl font-semibold">Optimization Tools</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        A/B test timing setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Performance tracking
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Smart scheduling tools
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Delivery analytics
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Standard Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• One-time sends</li>
                        <li>• Custom scheduling</li>
                        <li>• A/B testing</li>
                        <li>• Performance tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Product launches</li>
                        <li>• Event promotions</li>
                        <li>• Special offers</li>
                        <li>• Announcements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Automated Campaigns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Trigger-based sends</li>
                        <li>• Multi-step sequences</li>
                        <li>• Dynamic content</li>
                        <li>• Behavioral targeting</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Use Cases</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Welcome series</li>
                        <li>• Re-engagement</li>
                        <li>• Onboarding</li>
                        <li>• Follow-ups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Campaign Analytics</h2>
                <div className="text-sm text-gray-500">Track Performance</div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">1</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">2</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">3</span>
                    </div>
                    <div className="h-1 w-16 bg-blue-200"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">4</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold">Campaign Setup</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Campaign name and description
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Campaign type selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Objective setting
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Basic configuration
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="text-xl font-semibold">Audience Selection</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Target segment selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Exclusion rules setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Audience size preview
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Segment validation
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">✉️</span>
                      </div>
                      <h3 className="text-xl font-semibold">Content Creation</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Email template selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Subject line crafting
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Preview text optimization
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Personalization setup
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <h3 className="text-xl font-semibold">Campaign Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Sender details configuration
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Reply-to address setup
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Tracking options selection
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Compliance settings
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Key Metrics</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Open rates</li>
                    <li>• Click-through rates</li>
                    <li>• Conversion rates</li>
                    <li>• Bounce rates</li>
                    <li>• Unsubscribe rates</li>
                    <li>• Revenue generated</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Performance Analysis</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Audience engagement</li>
                    <li>• Content effectiveness</li>
                    <li>• Send time optimization</li>
                    <li>• Device performance</li>
                    <li>• Geographic insights</li>
                    <li>• ROI tracking</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h3 className="text-2xl font-semibold mb-4">Optimization Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Content Optimization</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Test subject lines</li>
                      <li>• Optimize email design</li>
                      <li>• Improve call-to-actions</li>
                      <li>• Enhance personalization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-3">Audience Optimization</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Segment your audience</li>
                      <li>• Clean email lists</li>
                      <li>• Optimize send times</li>
                      <li>• Monitor engagement</li>
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

export default CampaignManagementGuide; 
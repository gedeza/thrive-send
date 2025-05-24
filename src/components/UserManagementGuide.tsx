'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type TabId = 'roles' | 'users' | 'teams' | 'analytics';

const UserManagementGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('roles');

  const tabs = [
    { id: 'roles' as TabId, label: 'Roles & Permissions', icon: '👥' },
    { id: 'users' as TabId, label: 'User Management', icon: '👤' },
    { id: 'teams' as TabId, label: 'Team Management', icon: '👥' },
    { id: 'analytics' as TabId, label: 'Analytics & Security', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">User Management Guide</h1>
      
      <div className="mb-10">
        <p className="text-xl text-gray-700">
          Learn how to manage users, roles, and permissions in Thrive Send.
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
          {activeTab === 'roles' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Roles & Permissions</h2>
                <div className="text-sm text-gray-500">User Access Control</div>
              </div>

              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src="/docs/images/role-hierarchy.svg"
                  alt="Role Hierarchy"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Role Types</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Administrator</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Manage users and roles</li>
                        <li>• Configure system settings</li>
                        <li>• Access all analytics</li>
                        <li>• Manage campaigns and content</li>
                        <li>• Full system access</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Editor</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Create and edit content</li>
                        <li>• Publish content</li>
                        <li>• View analytics</li>
                        <li>• Manage own content</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Author</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Create content</li>
                        <li>• Edit own content</li>
                        <li>• View own analytics</li>
                        <li>• Basic content access</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">Viewer</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• View content</li>
                        <li>• Access basic analytics</li>
                        <li>• Read-only access</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Permission Matrix</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-medium mb-3">Content Management</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Create content</li>
                        <li>• Edit content</li>
                        <li>• Delete content</li>
                        <li>• Publish content</li>
                        <li>• View content</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">User Management</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Create users</li>
                        <li>• Edit users</li>
                        <li>• Delete users</li>
                        <li>• Assign roles</li>
                        <li>• View users</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium mb-3">System Access</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• View analytics</li>
                        <li>• Manage settings</li>
                        <li>• Access reports</li>
                        <li>• System configuration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">User Management</h2>
                <div className="text-sm text-gray-500">Manage Users</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-2xl font-semibold mb-4">User Setup</h3>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">1. Create New User</h4>
                    <ol className="space-y-4 text-lg text-gray-700">
                      <li>1. Click "Add User" button</li>
                      <li>2. Enter user's email address</li>
                      <li>3. Enter user's full name</li>
                      <li>4. Select user role</li>
                      <li>5. Set initial permissions</li>
                    </ol>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-4">2. User Configuration</h4>
                    <ol className="space-y-4 text-lg text-gray-700">
                      <li>1. Set team access</li>
                      <li>2. Define content permissions</li>
                      <li>3. Configure notification preferences</li>
                      <li>4. Set security settings</li>
                      <li>5. Save user profile</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">User Management</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">User Actions</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Edit user details</li>
                      <li>• Reset password</li>
                      <li>• Deactivate account</li>
                      <li>• Manage permissions</li>
                      <li>• View activity log</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xl font-medium mb-3">Security Features</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Two-factor authentication</li>
                      <li>• Password policies</li>
                      <li>• Session management</li>
                      <li>• Access restrictions</li>
                      <li>• Security notifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Team Management</h2>
                <div className="text-sm text-gray-500">Manage Teams</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team Setup Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Team Setup</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">1. Create Team</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Click "Create Team" button</li>
                        <li>2. Enter team name</li>
                        <li>3. Add team members</li>
                        <li>4. Set team permissions</li>
                        <li>5. Configure team settings</li>
                      </ol>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">2. Team Management</h4>
                      <ol className="space-y-4 text-lg text-gray-700">
                        <li>1. Add/remove members</li>
                        <li>2. Assign team roles</li>
                        <li>3. Set team permissions</li>
                        <li>4. Configure notifications</li>
                        <li>5. Manage team resources</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Team Collaboration Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Team Collaboration</h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Features</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Share resources</li>
                        <li>• Set up workflows</li>
                        <li>• Configure notifications</li>
                        <li>• Manage team calendar</li>
                        <li>• Track team activity</li>
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-xl font-medium mb-4">Team Settings</h4>
                      <ul className="space-y-2 text-lg text-gray-700">
                        <li>• Team visibility</li>
                        <li>• Access controls</li>
                        <li>• Resource sharing</li>
                        <li>• Communication preferences</li>
                        <li>• Team analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Management Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-semibold">Workflow Management</h2>
                  <div className="text-sm text-gray-500">Team Collaboration</div>
                </div>

                <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src="/docs/images/workflow-management.svg"
                    alt="Workflow Management Interface"
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-semibold mb-4">Workflow Stages</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-medium mb-3">Content Creation</h4>
                        <ul className="space-y-2 text-lg text-gray-700">
                          <li>• Draft creation</li>
                          <li>• Team feedback</li>
                          <li>• Content edits</li>
                          <li>• Quality check</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium mb-3">Approval Process</h4>
                        <ul className="space-y-2 text-lg text-gray-700">
                          <li>• Team lead review</li>
                          <li>• Department approval</li>
                          <li>• Legal compliance</li>
                          <li>• Final sign-off</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-semibold mb-4">Workflow Features</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-medium mb-3">Automation</h4>
                        <ul className="space-y-2 text-lg text-gray-700">
                          <li>• Task assignments</li>
                          <li>• Approval chains</li>
                          <li>• Email notifications</li>
                          <li>• Deadline reminders</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xl font-medium mb-3">Monitoring</h4>
                        <ul className="space-y-2 text-lg text-gray-700">
                          <li>• Progress tracking</li>
                          <li>• Task status</li>
                          <li>• Approval status</li>
                          <li>• Performance metrics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Monitoring Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Workflow Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-3">Progress Tracking</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Track workflow progress</li>
                      <li>• Monitor task completion</li>
                      <li>• View approval status</li>
                      <li>• Analyze bottlenecks</li>
                      <li>• Generate workflow reports</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xl font-medium mb-3">Performance Metrics</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Completion rates</li>
                      <li>• Time to approval</li>
                      <li>• Team efficiency</li>
                      <li>• Resource utilization</li>
                      <li>• Quality metrics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold">Analytics & Security</h2>
                <div className="text-sm text-gray-500">Track Activity</div>
              </div>

              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src="/docs/images/content-analytics.svg"
                  alt="User Analytics Dashboard"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Activity Tracking</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• User logins</li>
                    <li>• Content actions</li>
                    <li>• System changes</li>
                    <li>• Team activities</li>
                    <li>• Security events</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Security Monitoring</h3>
                  <ul className="space-y-3 text-lg text-gray-700">
                    <li>• Failed login attempts</li>
                    <li>• Suspicious activities</li>
                    <li>• Security breaches</li>
                    <li>• Access violations</li>
                    <li>• System alerts</li>
                    <li>• Compliance checks</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mt-8">
                <h3 className="text-2xl font-semibold mb-4">Security Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3">Authentication</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Two-factor authentication</li>
                      <li>• Password policies</li>
                      <li>• Session management</li>
                      <li>• IP restrictions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-3">Monitoring</h4>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• Activity logs</li>
                      <li>• Security alerts</li>
                      <li>• Access reports</li>
                      <li>• Compliance tracking</li>
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

export default UserManagementGuide; 
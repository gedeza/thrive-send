import React from 'react';
import UserManagementGuide from '@/components/UserManagementGuide';

export const metadata = {
  title: 'User Management Guide - Thrive Send',
  description: 'Learn how to manage users, roles, and permissions in Thrive Send',
};

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserManagementGuide />
    </div>
  );
} 
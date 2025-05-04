"use client"

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ContentCalendar } from '@/components/content/content-calendar';
import { Activity, CalendarIcon, ChevronLeft, ChevronRight, FileText, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Mock user for header
  const user = {
    name: "John Doe",
    avatarUrl: "https://github.com/shadcn.png"
  };

  // Mock sidebar items
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
    { key: 'calendar', label: 'Calendar', icon: <FileText size={16} />, isActive: true },
    { key: 'analytics', label: 'Analytics', icon: <Activity size={16} /> },
    { key: 'projects', label: 'Projects', icon: <Users size={16} /> },
    { key: 'creators', label: 'Creators', icon: <Users size={16} /> },
    { key: 'messages', label: 'Messages', icon: <FileText size={16} /> },
    { key: 'settings', label: 'Settings', icon: <FileText size={16} /> }
  ];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };


  return (
    <MainLayout 
      headerProps={{ 
        user,
        onSearch: (query) => console.log(`Searching: ${query}`)
      }}
      sidebarItems={sidebarItems}
    >
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <div className="flex -mb-px">
          <Link href="/dashboard" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Overview
          </Link>
          <Link href="/analytics" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Analytics
          </Link>
          <div className="py-2 px-4 text-sm font-medium text-primary border-b-2 border-primary">
            Calendar
          </div>
          <Link href="/clients" className="py-2 px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Clients
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content publishing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
          <Link href="/content/new">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create Content
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Content Schedule
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ContentCalendar onDateSelect={handleDateSelect} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Selected: ${new Date(selectedDate).toLocaleDateString()}` 
                  : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div>
                  <p className="mb-4">Scheduled content for this date:</p>
                  <Link href="/content/new">
                    <Button variant="outline" className="w-full">
                      Add Content
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground">Click a date on the calendar to view or add content</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </MainLayout>
  );
}

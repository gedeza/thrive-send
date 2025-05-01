"use client"

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import ContentCalendar from '@/components/content/content-calendar';
import ContentForm from '@/components/content/content-form';
import { Activity, CalendarIcon, FileText, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showContentForm, setShowContentForm] = useState(false);

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

  const handleContentSubmit = (values: { title: string; body: string }) => {
    console.log(`Saving content for date ${selectedDate}:`, values);
    setShowContentForm(false);
    // Here you would typically call an API to save the content
  };

  return (
    <MainLayout 
      headerProps={{ 
        user,
        onSearch: (query) => console.log(`Searching: ${query}`)
      }}
      sidebarItems={sidebarItems}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content publishing
          </p>
        </div>
        <Button onClick={() => setShowContentForm(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Content Schedule
              </CardTitle>
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
                  <Button 
                    variant="outline" 
                    onClick={() => setShowContentForm(true)}
                    className="w-full"
                  >
                    Add Content
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Click a date on the calendar to view or add content</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showContentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Create Content for ${new Date(selectedDate).toLocaleDateString()}` 
                  : 'Create Content'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContentForm
                onSubmit={handleContentSubmit}
              />
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowContentForm(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

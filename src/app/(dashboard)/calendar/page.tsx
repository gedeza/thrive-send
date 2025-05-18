"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const DAYS_IN_WEEK = 7;
const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock event data
const mockEvents = [
  { id: 1, date: '2025-05-08', title: 'Launch Campaign', color: '#3B82F6', time: '10:00', description: 'Kickoff meeting' },
  { id: 2, date: '2025-05-15', title: 'Content Review', color: '#10B981', time: '14:00', description: 'Review scheduled posts' },
  { id: 3, date: '2025-05-15', title: 'Design Sync', color: '#F59E0B', time: '16:00', description: 'Design team sync' },
  { id: 4, date: '2025-05-22', title: 'Newsletter', color: '#8B5CF6', time: '09:00', description: 'Send monthly newsletter' },
];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstWeekDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === DAYS_IN_WEEK) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < DAYS_IN_WEEK) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

function getEventsForDate(year: number, month: number, day: number) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return mockEvents.filter(e => e.date === dateStr);
}

export default function CustomCalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const monthMatrix = getMonthMatrix(currentYear, currentMonth);
  const displayedMonth = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" });

  // Get events for selected day
  const eventsForSelectedDay = selectedDay ? getEventsForDate(currentYear, currentMonth, selectedDay) : [];

  // Add badge logic to calendar grid
  function hasEvents(day: number | null) {
    if (!day) return false;
    return getEventsForDate(currentYear, currentMonth, day).length > 0;
  }

  // Modal form state
  const [form, setForm] = useState({ title: '', time: '', color: '#3B82F6', description: '' });
  function openAddEventModal(day: number) {
    setEditingEvent(null);
    setForm({ title: '', time: '', color: '#3B82F6', description: '' });
    setSelectedDay(day);
    setModalOpen(true);
  }
  function openEditEventModal(event: any) {
    setEditingEvent(event);
    setForm({ title: event.title, time: event.time, color: event.color, description: event.description });
    setModalOpen(true);
  }
  function handleFormChange(e: any) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSaveEvent() {
    // Here you would call your API to save the event
    setModalOpen(false);
  }
  function handleDeleteEvent() {
    // Here you would call your API to delete the event
    setModalOpen(false);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Content Calendar</h1>
          <p className="text-muted-foreground text-base">Schedule and manage your content publishing</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="font-medium"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button
            className="bg-primary text-primary-foreground font-semibold"
            onClick={() => router.push("/content/new")}
          >
            + Create Content
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="w-full lg:col-span-8 border bg-card rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Content Schedule
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 p-0"><ChevronLeft /></Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 p-0"><ChevronRight /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center text-lg font-medium">{displayedMonth}</div>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_LABELS.map(label => (
                <div key={label} className="text-xs text-muted-foreground font-semibold text-center py-1">{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-1">
              {monthMatrix.flat().map((day, idx) => {
                const isSelected = day === selectedDay;
                const events = day ? getEventsForDate(currentYear, currentMonth, day) : [];
                return (
                  <button
                    key={idx}
                    className={`relative rounded-lg border px-0 py-2 text-base font-medium transition-all
                      ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground hover:bg-muted'}
                      ${day ? '' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => day && setSelectedDay(day)}
                    onDoubleClick={() => day && openAddEventModal(day)}
                    tabIndex={day ? 0 : -1}
                    aria-label={day ? `Select day ${day}` : undefined}
                  >
                    {day || ''}
                    {/* Event badge */}
                    {events.length > 0 && day && (
                      <span className="absolute top-1 right-1 flex -space-x-1">
                        {events.slice(0, 3).map((e, i) => (
                          <span key={e.id} className="inline-block w-2.5 h-2.5 rounded-full border-2 border-card" style={{ backgroundColor: e.color, zIndex: 10 - i }} />
                        ))}
                        {events.length > 3 && <span className="text-xs ml-1">+{events.length - 3}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="w-full lg:col-span-4 border bg-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDay ? (
              <div>
                <div className="mb-2 font-medium">Selected: {displayedMonth} {selectedDay}</div>
                <Button className="w-full bg-primary text-primary-foreground mb-4" onClick={() => openAddEventModal(selectedDay!)}>
                  Add Content
                </Button>
                {eventsForSelectedDay.length > 0 ? (
                  <ul className="space-y-2">
                    {eventsForSelectedDay.map(event => (
                      <li key={event.id} className="flex items-center gap-2 p-2 rounded border hover:bg-muted cursor-pointer" onClick={() => openEditEventModal(event)}>
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                        <span className="font-medium">{event.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{event.time}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No events for this date.</div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Click a date on the calendar to view or add content</div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Event Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSaveEvent();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                className="w-full border rounded px-3 py-2"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Time</label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  name="time"
                  value={form.time}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Color</label>
                <input
                  type="color"
                  className="w-12 h-8 p-0 border-none bg-transparent"
                  name="color"
                  value={form.color}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
              />
            </div>
            <DialogFooter>
              {editingEvent && (
                <Button type="button" variant="destructive" onClick={handleDeleteEvent}>
                  Delete
                </Button>
              )}
              <Button type="submit" className="bg-primary text-primary-foreground">
                {editingEvent ? 'Update' : 'Add'}
              </Button>
              <DialogClose />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
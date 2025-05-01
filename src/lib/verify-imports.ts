/**
 * This file imports all components to ensure they're discoverable and correctly exported.
 * Run this file during development to verify imports are working.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form } from '@/components/ui/form';

import MainLayout from '@/components/layout/main-layout';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import AnalyticsCard from '@/components/analytics/analytics-card';

import ContentCalendar from '@/components/content/content-calendar';
import ContentForm from '@/components/content/content-form';

import ProfileCard from '@/components/user/profile-card';

import { ThemeProvider } from '@/components/theme-provider';

// Log that all imports are available
console.log('All component imports verified successfully');

// Export to avoid unused variables warnings
export const componentCheck = {
  Button,
  Card,
  DropdownMenu,
  Tabs,
  Input,
  Textarea,
  Label,
  Form,
  MainLayout,
  Header,
  Sidebar,
  AnalyticsDashboard,
  AnalyticsCard,
  ContentCalendar,
  ContentForm,
  ProfileCard,
  ThemeProvider
};
import React from 'react';
import { 
  Home, 
  Settings, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  Info,
  Bell,
  Mail,
  Calendar,
  Star,
  Heart,
  Share2,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { SystemGreenIcon } from './SystemGreenIcon';

// Navigation Examples
export const NavigationExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Navigation Icons</h3>
    
    {/* Primary Navigation */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Home} type="primary" size="primary" />
      <span>Primary Navigation Icon</span>
    </div>

    {/* Secondary Navigation */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Settings} type="neutral" size="secondary" />
      <span>Secondary Navigation Icon</span>
    </div>

    {/* Disabled Navigation */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={User} type="muted" size="primary" disabled />
      <span>Disabled Navigation Icon</span>
    </div>
  </div>
);

// Status Examples
export const StatusExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Status Icons</h3>
    
    {/* Success Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={CheckCircle} type="secondary" size="secondary" />
      <span>Success Status</span>
    </div>

    {/* Warning Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={AlertTriangle} type="accent" size="secondary" />
      <span>Warning Status</span>
    </div>

    {/* Error Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={XCircle} type="accent" size="secondary" />
      <span>Error Status</span>
    </div>
  </div>
);

// Metric Examples
export const MetricExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Metric Icons</h3>
    
    {/* Positive Metric */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={TrendingUp} type="secondary" size="small" />
      <span>Positive Trend</span>
    </div>

    {/* Negative Metric */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={TrendingDown} type="accent" size="small" />
      <span>Negative Trend</span>
    </div>

    {/* Neutral Metric */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Minus} type="neutral" size="small" />
      <span>No Change</span>
    </div>
  </div>
);

// Chart Control Examples
export const ChartControlExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Chart Controls</h3>
    
    {/* Primary Control */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={RefreshCw} type="primary" size="small" />
      <span>Refresh Data</span>
    </div>

    {/* Secondary Control */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Download} type="neutral" size="small" />
      <span>Download Report</span>
    </div>

    {/* Info Control */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Info} type="neutral" size="micro" />
      <span>Chart Information</span>
    </div>
  </div>
);

// Notification Examples
export const NotificationExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Notification Icons</h3>
    
    {/* Bell with Badge */}
    <div className="flex items-center space-x-4">
      <div className="relative">
        <SystemGreenIcon as={Bell} type="primary" size="secondary" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full" />
      </div>
      <span>Notifications</span>
    </div>

    {/* Mail Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Mail} type="secondary" size="secondary" />
      <span>New Messages</span>
    </div>

    {/* Calendar Event */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Calendar} type="neutral" size="secondary" />
      <span>Upcoming Events</span>
    </div>
  </div>
);

// Action Examples
export const ActionExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Action Icons</h3>
    
    {/* Favorite Action */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Heart} type="accent" size="small" />
      <span>Add to Favorites</span>
    </div>

    {/* Share Action */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Share2} type="primary" size="small" />
      <span>Share Content</span>
    </div>

    {/* Star Rating */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Star} type="accent" size="small" />
      <span>Rate Item</span>
    </div>
  </div>
);

// Form Control Examples
export const FormControlExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Form Controls</h3>
    
    {/* Search Input */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Search} type="neutral" size="small" />
      <span>Search Field</span>
    </div>

    {/* Filter Control */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Filter} type="primary" size="small" />
      <span>Filter Options</span>
    </div>

    {/* Add Button */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Plus} type="secondary" size="small" />
      <span>Add New Item</span>
    </div>
  </div>
);

// CRUD Examples
export const CrudExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">CRUD Operations</h3>
    
    {/* Edit Action */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Edit} type="primary" size="small" />
      <span>Edit Item</span>
    </div>

    {/* Delete Action */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Trash2} type="accent" size="small" />
      <span>Delete Item</span>
    </div>

    {/* View Toggle */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Eye} type="neutral" size="small" />
      <span>View Details</span>
    </div>
  </div>
);

// Security Examples
export const SecurityExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Security Icons</h3>
    
    {/* Lock Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Lock} type="primary" size="secondary" />
      <span>Secure Content</span>
    </div>

    {/* Unlock Status */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={Unlock} type="secondary" size="secondary" />
      <span>Public Content</span>
    </div>

    {/* Visibility Toggle */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={EyeOff} type="neutral" size="small" />
      <span>Hide Sensitive Data</span>
    </div>
  </div>
);

// Navigation Control Examples
export const NavigationControlExamples = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Navigation Controls</h3>
    
    {/* Dropdown Indicator */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={ChevronDown} type="neutral" size="small" />
      <span>Expand Menu</span>
    </div>

    {/* Pagination Controls */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={ChevronLeft} type="primary" size="small" />
      <SystemGreenIcon as={ChevronRight} type="primary" size="small" />
      <span>Page Navigation</span>
    </div>

    {/* Accordion Control */}
    <div className="flex items-center space-x-4">
      <SystemGreenIcon as={ChevronUp} type="neutral" size="small" />
      <span>Collapse Section</span>
    </div>
  </div>
);

// Combined Example
export const SystemGreenIconExamples = () => (
  <div className="p-6 space-y-8">
    <h2 className="text-2xl font-bold">SystemGreenIcon Examples</h2>
    
    <NavigationExamples />
    <StatusExamples />
    <MetricExamples />
    <ChartControlExamples />
    <NotificationExamples />
    <ActionExamples />
    <FormControlExamples />
    <CrudExamples />
    <SecurityExamples />
    <NavigationControlExamples />
  </div>
); 
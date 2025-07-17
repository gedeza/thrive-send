import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  onCancel: () => void;
  onReset?: () => void;
  submitText?: string;
  showDraft?: boolean;
}

// Standardized form action component
export function FormActions({ 
  mode = 'create', 
  isSubmitting = false, 
  onCancel, 
  onReset,
  submitText,
  showDraft = false 
}: FormActionsProps) {
  return (
    <div className="flex justify-between pt-6 border-t">
      <div className="flex gap-2">
        {onReset && (
          <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
            Reset
          </Button>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {showDraft && (
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            Save as Draft
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitText || (mode === 'edit' ? 'Update' : 'Create')}
        </Button>
      </div>
    </div>
  );
}
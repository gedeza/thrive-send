// Standardized form action component
export function FormActions({ 
  mode, 
  isSubmitting, 
  onCancel, 
  onReset,
  submitText,
  showDraft = false 
}) {
  return (
    <div className="flex justify-between pt-6 border-t">
      <div className="flex gap-2">
        {onReset && (
          <Button type="button" variant="outline" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
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
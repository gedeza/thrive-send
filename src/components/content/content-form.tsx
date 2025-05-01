"use client"

import React, { useState, FormEvent } from 'react';

export interface ContentFormValues {
  title: string;
  body: string;
}

export interface ContentFormProps {
  initialValues?: Partial<ContentFormValues>;
  onSubmit?: (values: ContentFormValues) => void | Promise<void>;
  Editor?: React.ComponentType<{ value: string; onChange(v: string): void }>;
}

/* The tests seem to mock an Editor component, so we allow it to be injected */
const DefaultEditor: React.FC<{ value: string; onChange(v: string): void }> = ({
  value,
  onChange
}) => (
  <textarea
    data-testid="content-form-editor"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={6}
    style={{ width: '100%' }}
  />
);

const ContentForm: React.FC<ContentFormProps> = ({
  initialValues = {},
  onSubmit,
  Editor = DefaultEditor
}) => {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [body, setBody] = useState(initialValues.body ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = onSubmit({ title, body });
      
      // Handle both synchronous and Promise-based onSubmit
      if (result instanceof Promise) {
        await result;
      }
      
      setSuccess("Content saved successfully");
      setSubmitting(false);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("Failed to save content");
      setSubmitting(false);
    }
  };

  return (
    <form data-testid="content-form" onSubmit={handleSubmit}>
      {error && (
        <div data-testid="content-form-error" style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}
      
      {success && (
        <div data-testid="content-form-success" style={{ color: 'green', marginBottom: 8 }}>
          {success}
        </div>
      )}
      
      <input
        data-testid="content-form-title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', marginBottom: 8, width: '100%' }}
        disabled={submitting}
      />
      
      <Editor value={body} onChange={setBody} />
      
      <button 
        type="submit" 
        data-testid="content-form-submit"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ContentForm;

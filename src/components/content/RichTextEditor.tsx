import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Highlighter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Create a lowlight instance with common languages
const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-1 border rounded-lg bg-muted">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-background')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-background')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') && 'bg-background')}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-background')}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-background')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-background')}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-background')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-background')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-background')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={cn(editor.isActive('link') && 'bg-background')}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') && 'bg-background')}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={cn(editor.isActive('highlight') && 'bg-background')}
        >
          <Highlighter className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. Install dependencies:
 *    yarn add @tiptap/react @tiptap/core @tiptap/extension-table @tiptap/extension-code-block-lowlight @tiptap/starter-kit lowlight highlight.js
 * 
 * 2. Use the component in your ContentForm:
 *    <RichTextEditor value={formData.content} onChange={val => setFormData(prev => ({ ...prev, content: val }))} />
 * 
 * 3. Image uploads are handled through the uploadMedia API function which should
 *    handle the file upload to your backend or CDN and return the URL.
 * 
 * 4. To add more code block languages:
 *    import more languages from highlight.js and add to createLowlight above.
 *    e.g. import go from 'highlight.js/lib/languages/go';
 *         const lowlight = createLowlight({ ...common, javascript, python, go });
 * 
 * 5. See TipTap docs for further toolbar/UI enhancement, collaborative features, embeds, etc.
 */

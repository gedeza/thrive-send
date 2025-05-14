import React, { useCallback, useRef } from 'react';
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import { uploadMedia } from '../../lib/api';

// Create a lowlight instance with the common languages, and add extras as needed:
const lowlight = createLowlight({
  ...common,
  javascript,
  python,
});
// You can register more languages as needed:
// e.g., import go from 'highlight.js/lib/languages/go';
// then add: go, above in the object.

type Props = {
  value: string;
  onChange?: (html: string) => void;
  editable?: boolean;
};

const RichTextEditor: React.FC<Props> = ({ value, onChange, editable = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false // We'll use CodeBlockLowlight for better highlighting!
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // UI example: Insert table, code block, image
  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const insertCodeBlock = useCallback(() => {
    editor?.chain().focus().setCodeBlock().run();
  }, [editor]);

  // Add image from a file (upload to backend first)
  const insertImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const uploaded = await uploadMedia(file);
        editor?.chain().focus().setImage({ src: uploaded.url }).run();
      } catch (err) {
        alert('Image upload failed!');
      } finally {
        // reset input value for next pick
        e.target.value = '';
      }
    }
  };

  // add image from URL (as fallback)
  const addImageUrl = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button 
          type="button" onClick={insertTable} style={{ marginRight: 8 }}>
          Insert Table
        </button>
        <button 
          type="button" onClick={insertCodeBlock} style={{ marginRight: 8 }}>
          Insert Code Block
        </button>
        <button 
          type="button" onClick={addImageUrl} style={{ marginRight: 8 }}>
          Insert Image by URL
        </button>
        <button 
          type="button" onClick={() => inputRef.current?.click()} style={{ marginRight: 8 }}>
          Upload Image File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={insertImageFile}
        />
      </div>

      <EditorContent editor={editor} />

      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
      >
        <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ margin: '0 4px' }}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ margin: '0 4px' }}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} style={{ margin: '0 4px' }}>
          Strike
        </button>
        <button onClick={() => editor.chain().focus().toggleCode().run()} style={{ margin: '0 4px' }}>
          Inline Code
        </button>
      </BubbleMenu>
    </div>
  );
};

export default RichTextEditor;

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

'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface EditorComponentProps {
  data?: OutputData | null;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export interface EditorHandle {
  save: () => Promise<OutputData | null>;
}

/**
 * EditorJS wrapper component for markdown-style editing
 * Supports: h1-h4, ordered/unordered lists, paragraphs, images, warnings
 * Text formatting: bold and hyperlinks (via inline toolbar)
 */
export const EditorComponent = forwardRef<EditorHandle, EditorComponentProps>(function EditorComponent(
  { data, onChange, readOnly = false, placeholder = 'Start writing your guide...' },
  ref
) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const isReadyRef = useRef(false);

  // Expose save() to parent components
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorRef.current && isReadyRef.current) {
        try {
          return await editorRef.current.save();
        } catch (e) {
          console.error('Editor save failed:', e);
          return null;
        }
      }
      return null;
    },
  }));

  useEffect(() => {
    if (!holderRef.current || isInitializedRef.current || typeof window === 'undefined') return;

    isInitializedRef.current = true;

    let cancelled = false;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const Warning = (await import('@editorjs/warning')).default;

      if (!holderRef.current || cancelled) return;

      // Destroy any existing instance bound to this component
      if (editorRef.current && (editorRef.current as any)?.destroy) {
        try {
          (editorRef.current as any).destroy();
        } catch {}
        editorRef.current = null;
      }

      // Ensure holder is clean and unique to avoid duplicate editors
      holderRef.current.innerHTML = '';

      // Initialize Editor.js
      const editor = new EditorJS({
        holder: holderRef.current!,
        data: data || undefined,
        readOnly,
        placeholder,
        minHeight: 200,

        onReady: () => {
          isReadyRef.current = true;
        },
        
        // Type cast tools to avoid TypeScript errors with EditorJS plugin types
        tools: {
          header: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Header as any,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
            inlineToolbar: ['bold', 'link'],
          },
          list: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: List as any,
            inlineToolbar: ['bold', 'link'],
            config: {
              defaultStyle: 'unordered',
            },
          },
          paragraph: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Paragraph as any,
            inlineToolbar: ['bold', 'link'],
          },
          image: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: ImageTool as any,
            config: {
              /**
               * For now, we'll use URL-based images
               * In production, you'd integrate with your Supabase upload endpoint
               */
              endpoints: {
                byUrl: '/api/admin/fetch-image-url', // Endpoint to validate/fetch image by URL
              },
              field: 'url',
              types: 'image/*',
            },
          },
          warning: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Warning as any,
            inlineToolbar: ['bold', 'link'],
            config: {
              titlePlaceholder: 'Warning title',
              messagePlaceholder: 'Warning message',
            },
          },
        },

        onChange: async () => {
          if (onChange && editorRef.current && isReadyRef.current) {
            try {
              const outputData = await editorRef.current.save();
              onChange(outputData);
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          }
        },

        // Remove default inline tools we don't want
        inlineToolbar: ['bold', 'link'],
      });

      if (!cancelled) {
        editorRef.current = editor;
      } else {
        try {
          // If initialized after unmount, destroy immediately
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor as any)?.destroy?.();
        } catch {}
      }
    };

    initEditor();

    // Cleanup
    return () => {
      cancelled = true;
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      isInitializedRef.current = false;
      isReadyRef.current = false;
    };
    // Only initialize once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when prop changes (for editing existing content)
  useEffect(() => {
    if (editorRef.current && data && isReadyRef.current) {
      editorRef.current.render(data);
    }
  }, [data]);

  return (
    <div className="border rounded-md">
      <div
        ref={holderRef}
        className="prose prose-sm max-w-none p-4"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
});

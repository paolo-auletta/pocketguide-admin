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
  const dataToRenderRef = useRef<OutputData | null | undefined>(data);
  const userEditTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        readOnly,
        placeholder,
        minHeight: 200,

        onReady: () => {
          console.log('Editor onReady fired, dataToRenderRef.current:', dataToRenderRef.current);
          isReadyRef.current = true;
          // Render initial data if available
          if (dataToRenderRef.current && Array.isArray((dataToRenderRef.current as any).blocks) && (dataToRenderRef.current as any).blocks.length > 0) {
            console.log('Rendering data in onReady:', dataToRenderRef.current);
            try {
              editorRef.current?.render(dataToRenderRef.current);
            } catch (e) {
              console.error('Failed to render initial editor data:', e);
            }
          }
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
            shortcut: 'CMD+ALT+H',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toolbox: {
              icon: '<svg class="icon icon--header"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-header"></use></svg>',
              title: 'Heading',
            } as any,
          },
          list: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: List as any,
            inlineToolbar: ['bold', 'link'],
            config: {
              defaultStyle: 'unordered',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toolbox: {
              icon: '<svg class="icon icon--list"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-list"></use></svg>',
              title: 'List',
            } as any,
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toolbox: {
              icon: '<svg class="icon icon--image"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-image"></use></svg>',
              title: 'Image',
            } as any,
          },
          warning: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Warning as any,
            inlineToolbar: ['bold', 'link'],
            config: {
              titlePlaceholder: 'Warning title',
              messagePlaceholder: 'Warning message',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toolbox: {
              icon: '<svg class="icon icon--warning"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-warning"></use></svg>',
              title: 'Warning',
            } as any,
          },
        },

        onChange: async () => {
          if (onChange && editorRef.current && isReadyRef.current) {
            try {
              const outputData = await editorRef.current.save();
              onChange(outputData);
              
              // Ignore data changes for 500ms after user edit to prevent re-render
              if (userEditTimeoutRef.current) clearTimeout(userEditTimeoutRef.current);
              userEditTimeoutRef.current = setTimeout(() => {
                userEditTimeoutRef.current = null;
              }, 500);
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
    console.log('EditorComponent data prop changed:', data, 'isReady:', isReadyRef.current, 'editorRef exists:', !!editorRef.current, 'ignoreUpdates:', !!userEditTimeoutRef.current);
    
    // If user just edited, ignore this update (it's the echo from onChange)
    if (userEditTimeoutRef.current) {
      console.log('Skipping re-render because user is editing');
      return;
    }
    
    dataToRenderRef.current = data;
    if (editorRef.current && data && isReadyRef.current) {
      console.log('Rendering data into editor:', data);
      try {
        editorRef.current.render(data);
      } catch (e) {
        console.error('Error rendering data:', e);
      }
    }
  }, [data]);

  return (
    <div className="border rounded-md overflow-hidden">
      <style>{`
        .ce-block__content {
          max-width: 100%;
        }
        .ce-header {
          font-weight: bold;
          margin: 0.5em 0;
          line-height: 1.2;
        }
        /* Target h1-h4 tags with ce-header class */
        h1.ce-header {
          font-size: 32px !important;
          margin: 0 !important;
        }
        h2.ce-header {
          font-size: 24px !important;
          margin: 0 !important;
        }
        h3.ce-header {
          font-size: 20px !important;
          margin: 0 !important;
        }
        h4.ce-header {
          font-size: 18px !important;
          margin: 0 !important;
        }
        .ce-paragraph {
          margin: 0.5em 0;
          font-size: 16px;
        }
        .ce-list {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .ce-list__item {
          margin: 0.25em 0;
        }
      `}</style>
      <div
        ref={holderRef}
        className="prose prose-sm max-w-none p-4"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
});

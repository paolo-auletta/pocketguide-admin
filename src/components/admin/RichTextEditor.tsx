"use client";

import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string; // JSON stringified blocks or empty string
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label = "Description",
  placeholder = "Start writing your description...",
}: RichTextEditorProps) {
  const [initialContent, setInitialContent] = useState<Block[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  // Parse the initial content
  useEffect(() => {
    try {
      if (value && value.trim()) {
        const parsed = JSON.parse(value);
        setInitialContent(parsed);
      } else {
        // Default to undefined to let BlockNote create an empty document
        setInitialContent(undefined);
      }
    } catch (error) {
      console.error("Error parsing initial content:", error);
      // On error, let BlockNote create a default empty document
      setInitialContent(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [value]);

  // Create the editor with initial content
  const editor = useCreateBlockNote({
    initialContent,
  });

  // Handle content changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const blocks = editor.document;
      onChange(JSON.stringify(blocks));
    };

    // Listen to editor changes
    editor.onChange(handleUpdate);
  }, [editor, onChange]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="min-h-[200px] w-full rounded-lg border bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="rich-text-editor-wrapper group rounded-lg border border-input bg-card overflow-hidden shadow-sm hover:border-ring transition-all duration-200">
        <div className="p-4">
          <BlockNoteView
            editor={editor}
            theme="light"
            className="min-h-[200px] prose prose-sm max-w-none
              [&_.bn-editor]:outline-none
              [&_.bn-editor]:min-h-[200px]
              [&_.bn-editor]:text-foreground
              [&_.bn-block]:text-foreground
              [&_.bn-block-content]:text-foreground
              [&_.bn-inline-content]:text-foreground
              [&_h1]:text-2xl
              [&_h1]:font-bold
              [&_h1]:mb-2
              [&_h2]:text-xl
              [&_h2]:font-semibold
              [&_h2]:mb-2
              [&_h3]:text-lg
              [&_h3]:font-semibold
              [&_h3]:mb-1
              [&_p]:leading-relaxed
              [&_p]:mb-3
              [&_ul]:my-2
              [&_ol]:my-2
              [&_li]:leading-relaxed
              [&_blockquote]:border-l-4
              [&_blockquote]:border-primary
              [&_blockquote]:pl-4
              [&_blockquote]:italic
              [&_code]:bg-muted
              [&_code]:px-1.5
              [&_code]:py-0.5
              [&_code]:rounded
              [&_code]:text-sm
              [&_code]:font-mono
            "
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted font-mono">
          /
        </kbd>
        <span>for commands or select text to format</span>
      </p>
    </div>
  );
}

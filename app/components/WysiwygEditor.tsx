"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  toolbarPreset?: 'full' | 'simple';
}

export default function WysiwygEditor({ 
  value, 
  onChange, 
  placeholder = "Skriv ditt innehåll här...", 
  height = 400,
  className = "",
  toolbarPreset = 'full'
}: WysiwygEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import Quill CSS dynamically
    import('quill/dist/quill.snow.css');
    
    // Dynamisk import av React Quill för att undvika SSR-problem
    import('react-quill').then((mod) => {
      setReactQuill(() => mod.default);
    });
  }, []);

  const toolbarFull = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ];

  const toolbarSimple = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote'],
    ['link'],
    ['clean']
  ];

  const modules = {
    toolbar: toolbarPreset === 'simple' ? toolbarSimple : toolbarFull,
    clipboard: {
      matchVisual: false,
    }
  };

  const formatsFull = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'code-block'
  ];

  const formatsSimple = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link',
    'align'
  ];

  const formats = toolbarPreset === 'simple' ? formatsSimple : formatsFull;

  if (!isClient || !ReactQuill) {
    return (
      <div className={`${className}`}>
        <div 
          className="w-full border border-gray-300 rounded-2xl bg-gray-50 flex items-center justify-center"
          style={{ height: height + 42 }} // +42 för toolbar
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-8 h-8 border-2 border-[#93C560] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Laddar editor...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className} wysiwyg-editor`}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: height,
          borderRadius: '1rem',
          overflow: 'hidden'
        }}
      />
      
      <style jsx global>{`
        .wysiwyg-editor .ql-snow {
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          font-family: 'Work Sans', sans-serif;
        }
        
        .wysiwyg-editor .ql-toolbar {
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          background: #fafafa;
          padding: 12px 16px;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        
        .wysiwyg-editor .ql-container {
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          font-size: 16px;
          line-height: 1.6;
          height: ${Math.max(height - 56, 220)}px;
        }
        
        .wysiwyg-editor .ql-editor {
          padding: 20px;
          min-height: ${Math.max(height - 56, 220)}px;
          height: ${Math.max(height - 56, 220)}px;
          overflow-y: auto;
          font-family: 'Work Sans', sans-serif;
          color: #1f2937;
        }
        
        .wysiwyg-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          font-weight: 300;
        }
        
        .wysiwyg-editor .ql-toolbar .ql-formats {
          margin-right: 12px;
        }
        
        .wysiwyg-editor .ql-toolbar button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          margin: 0 2px;
          transition: all 0.2s;
        }
        
        .wysiwyg-editor .ql-toolbar button:hover {
          background-color: #93C560;
          color: white;
        }
        
        .wysiwyg-editor .ql-toolbar button.ql-active {
          background-color: #93C560;
          color: white;
        }
        
        .wysiwyg-editor .ql-toolbar .ql-picker {
          border-radius: 8px;
        }
        
        .wysiwyg-editor .ql-toolbar .ql-picker-label:hover,
        .wysiwyg-editor .ql-toolbar .ql-picker-label.ql-active {
          color: #93C560;
        }
        
        .wysiwyg-editor .ql-editor h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #014421;
          margin: 1rem 0;
        }
        
        .wysiwyg-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #014421;
          margin: 0.75rem 0;
        }
        
        .wysiwyg-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #014421;
          margin: 0.5rem 0;
        }
        
        .wysiwyg-editor .ql-editor p {
          margin-bottom: 1rem;
        }
        
        .wysiwyg-editor .ql-editor strong {
          font-weight: 600;
          color: #014421;
        }
        
        .wysiwyg-editor .ql-editor em {
          font-style: italic;
          color: #4b5563;
        }
        
        .wysiwyg-editor .ql-editor ul, 
        .wysiwyg-editor .ql-editor ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .wysiwyg-editor .ql-editor li {
          margin-bottom: 0.5rem;
        }
        
        .wysiwyg-editor .ql-editor blockquote {
          border-left: 4px solid #93C560;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background-color: #f3efe3;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .wysiwyg-editor .ql-editor a {
          color: #93C560;
          text-decoration: underline;
        }
        
        .wysiwyg-editor .ql-editor a:hover {
          color: #7BA94D;
        }
        
        .wysiwyg-editor .ql-editor .ql-code-block-container {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        .wysiwyg-editor .ql-editor .ql-code-block {
          background-color: transparent;
          color: #374151;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          padding: 1rem;
        }
        
        .wysiwyg-editor .ql-snow .ql-tooltip {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .wysiwyg-editor .ql-snow .ql-tooltip input[type=text] {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }
        
        .wysiwyg-editor .ql-snow .ql-tooltip a.ql-action::after {
          content: 'Spara';
        }
        
        .wysiwyg-editor .ql-snow .ql-tooltip a.ql-remove::before {
          content: 'Ta bort';
        }
        
        /* Fokus-stil */
        .wysiwyg-editor .ql-container.ql-snow {
          transition: all 0.2s;
        }
        
        .wysiwyg-editor .ql-editor:focus {
          outline: none;
        }
        
        .wysiwyg-editor .ql-snow.ql-focused .ql-editor {
          border-color: #93C560;
        }
      `}</style>
    </motion.div>
  );
} 

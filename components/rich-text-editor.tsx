"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-gray-50 animate-pulse rounded-md" />
});

interface RichTextEditorProps {
    title?: string;
    value: string;
    onChange: (value: string) => void;
    onSave?: () => void;
    onClose?: () => void;
}

// Optimization: Move config objects outside the component to prevent re-creation on every render
const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link"],
        ["clean"],
    ],
};

// Optimization: Correct formats list. 
// "bullet" is part of the "list" format, not a standalone format registration.
const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list", // This covers both ordered and bullet lists
    "indent",
    "link",
];

const RichTextEditor = memo(({
    title,
    value,
    onChange,
    onSave,
    onClose,
}: RichTextEditorProps) => {
    return (
        <div className="flex flex-col h-full bg-white border rounded-md overflow-hidden">
            {title && (
                <div className="p-2 border-b font-semibold text-gray-700 bg-gray-50">{title}</div>
            )}
            <div className="flex-1 overflow-auto bg-white">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    className="h-full rich-text-editor"
                    placeholder="Start typing here..."
                />
            </div>
            <style jsx global>{`
        .rich-text-editor .ql-container {
          height: calc(100% - 42px) !important;
          font-size: 14px;
          border: none !important;
        }
        .rich-text-editor .ql-toolbar {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          background: #f8fafc;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;

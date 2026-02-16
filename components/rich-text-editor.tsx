"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    onSave: () => void;
    onClose: () => void;
    title: string;
}

export default function RichTextEditor({ value, onChange, onSave, onClose, title }: RichTextEditorProps) {
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleLocalChange = (content: string) => {
        setLocalValue(content);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            onChange(content);
        }, 300);
    };

    const handleSaveClick = () => {
        onChange(localValue);
        onSave();
    };

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    }), []);

    const formats = [
        'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'header', 'blockquote', 'code-block',
        'list', 'indent',
        'direction', 'align',
        'link', 'image', 'video'
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden bg-white border rounded-md">
                <div className="h-full quill-editor-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={localValue}
                        onChange={handleLocalChange}
                        modules={modules}
                        formats={formats}
                        className="h-full flex flex-col"
                        placeholder="Type your content here..."
                    />
                </div>
            </div>
            <style jsx global>{`
                .quill-editor-wrapper .ql-container {
                    flex: 1;
                    font-size: 16px;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .quill-editor-wrapper .ql-toolbar {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    background: #f8fafc;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .quill-editor-wrapper .ql-editor {
                    min-height: 200px;
                    padding: 2rem;
                    line-height: 1.6;
                }
            `}</style>
        </div>
    );
}

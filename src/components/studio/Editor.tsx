"use client";

import React from 'react';
import { FileCode, Save } from 'lucide-react';

interface EditorProps {
    file: { path: string; content: string } | undefined;
}

export const Editor: React.FC<EditorProps> = ({ file }) => {
    const filename = file?.path || '';
    const code = file?.content || '';
    if (!filename) {
        return (
            <div className="flex flex-col h-full bg-[#0D0D10] border border-white/5 rounded-xl overflow-hidden shadow-2xl items-center justify-center">
                <FileCode size={48} className="text-white/5 mb-4" />
                <p className="text-white/20 text-sm font-mono italic">Select a file to view code</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0D0D10] border border-white/5 rounded-xl overflow-hidden shadow-2xl relative group">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-purple-400" />
                    <span className="text-[10px] font-mono text-white/50 font-bold uppercase tracking-wider">{filename}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 font-mono text-sm relative">
                <pre className="text-white/80 leading-relaxed selection:bg-purple-500/30">
                    <code>{code}</code>
                </pre>
            </div>

            {/* Decorative gradient flare */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>
    );
};

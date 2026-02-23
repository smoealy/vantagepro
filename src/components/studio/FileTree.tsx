"use client";

import React from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { ProjectFile } from '@/lib/swarm/manager';

interface FileTreeProps {
    files: any[];
    activeFile: string | null;
    onSelectFile: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, activeFile, onSelectFile }) => {
    return (
        <div className="flex flex-col h-full bg-[#0D0D10] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                <Folder size={14} className="text-white/50" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">Project Explorer</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {files.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/10 text-xs italic">
                        No files yet
                    </div>
                ) : (
                    files.map((file) => (
                        <button
                            key={file.path}
                            onClick={() => onSelectFile(file.path)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all group ${activeFile === file.path
                                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                                }`}
                        >
                            <File size={14} className={activeFile === file.path ? 'text-purple-400' : 'text-white/20'} />
                            <span className="truncate">{file.path}</span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

"use client";

import React from 'react';
import { Layout, MessageSquare, Files, Settings, Box, Database, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-14 border-r border-white/5 bg-[#080808] flex flex-col items-center py-6 gap-8 shrink-0">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shadow-inner">
                <Sparkles size={20} />
            </div>

            <div className="flex flex-col gap-6">
                <button className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                    <Layout size={20} />
                </button>
                <button className="p-2 rounded-xl text-white hover:bg-white/5 transition-all shadow-2xl">
                    <Files size={20} />
                </button>
                <button className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                    <Database size={20} />
                </button>
                <button className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                    <Box size={20} />
                </button>
            </div>

            <div className="mt-auto flex flex-col gap-6">
                <button className="p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                    <Settings size={20} />
                </button>
            </div>
        </aside>
    );
};

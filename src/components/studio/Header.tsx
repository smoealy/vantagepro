"use client";

import React from 'react';
import { Zap, Code, Eye, Share2, Rocket, Layout, Settings } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

interface HeaderProps {
    activeTab: 'code' | 'preview';
    setActiveTab: (tab: 'code' | 'preview') => void;
    isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isProcessing }) => {
    return (
        <header className="h-14 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0 z-50">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="font-black tracking-tighter text-sm">VANTAGE <span className="text-white/40">PRO</span></span>
                </Link>

                <div className="h-4 w-[1px] bg-white/10 mx-2" />

                <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'code' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'
                            }`}
                    >
                        <Code size={12} /> Code
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'
                            }`}
                    >
                        <Eye size={12} /> Preview
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isProcessing && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Swarm Active</span>
                    </div>
                )}

                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white/10 transition-all">
                    <Share2 size={12} /> Share
                </button>

                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
                    <Rocket size={12} /> Deploy
                </button>

                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    );
};

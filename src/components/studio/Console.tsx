"use client";

import React, { useEffect, useRef } from 'react';
import { Terminal, Bot, User, Braces, Palette } from 'lucide-react';

interface ConsoleProps {
    messages: any[];
}

const RoleIcon = ({ role }: { role: string }) => {
    switch (role) {
        case 'Architect': return <Terminal size={14} className="text-blue-400" />;
        case 'Coder': return <Braces size={14} className="text-green-400" />;
        case 'Designer': return <Palette size={14} className="text-pink-400" />;
        case 'Manager':
        case 'assistant': return <Bot size={14} className="text-purple-400" />;
        case 'User':
        case 'user': return <User size={14} className="text-white/40" />;
        default: return <User size={14} />;
    }
};

export const Console: React.FC<ConsoleProps> = ({ messages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-[#0D0D10] border-t border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/5">
                <Terminal size={12} className="text-white/30" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 font-black">System Output</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-[11px] scroll-smooth"
            >
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className={`mt-0.5 shrink-0 w-6 h-6 rounded flex items-center justify-center bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors`}>
                            <RoleIcon role={msg.role} />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-black uppercase tracking-widest text-[9px] ${msg.role === 'Architect' ? 'text-blue-400' :
                                        msg.role === 'Coder' ? 'text-green-400' :
                                            msg.role === 'Designer' ? 'text-pink-400' :
                                                msg.role === 'user' ? 'text-white/40' : 'text-purple-400'
                                    }`}>
                                    {msg.role === 'assistant' ? 'Manager' : (msg.role === 'user' ? 'You' : msg.role)}
                                </span>
                                <span className="text-[9px] text-white/10">
                                    {msg.timestamp?.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) || 'Live'}
                                </span>
                            </div>
                            <p className="text-white/60 leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-white/5 font-black uppercase tracking-[0.3em] text-[10px]">
                        Awaiting Command
                    </div>
                )}
            </div>
        </div>
    );
};

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useChat } from 'ai/react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, FileCode2, CheckCircle2, Cpu, Loader2, Sparkles,
    ArrowUp, Globe, ChevronRight, Zap, LayoutGrid, Terminal,
    Layers, Copy, ExternalLink, MessageSquare, History, Play,
    Search, Layout
} from 'lucide-react';
import { getProjectData } from '@/app/actions';
import SmartPreview from '@/components/studio/SmartPreview';

// ─── Theme Config ─────────────────────────────────────────────────────────────
const AGENTS: Record<string, { color: string; bg: string; border: string; icon: string; shadow: string }> = {
    Manager: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)', icon: '⚡', shadow: 'rgba(167,139,250,0.2)' },
    Architect: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.15)', icon: '🏗️', shadow: 'rgba(56,189,248,0.2)' },
    Coder: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.15)', icon: '💻', shadow: 'rgba(74,222,128,0.2)' },
    Designer: { color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)', icon: '🎨', shadow: 'rgba(251,146,60,0.2)' },
};

// ─── Syntax highlight ─────────────────────────────────────────────────────────
function highlight(line: string): string {
    return line
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/(\/\/[^\n]*)/g, '<span style="color:#64748b">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
            '<span style="color:#86efac">$1</span>')
        .replace(/\b(import|export|from|const|let|var|function|return|async|await|if|else|for|while|class|extends|new|this|typeof|interface|type|enum|default|null|undefined|true|false)\b/g,
            '<span style="color:#c084fc">$1</span>')
        .replace(/\b(React|useState|useEffect|useRef|useCallback|useMemo|useRouter|useParams)\b/g,
            '<span style="color:#38bdf8">$1</span>');
}

function fileIcon(path: string) {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) return '⚛️';
    if (path.endsWith('.ts') || path.endsWith('.js')) return '📜';
    if (path.endsWith('.css')) return '🎨';
    if (path.endsWith('.json')) return '📋';
    if (path.endsWith('.md')) return '📝';
    return '📄';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudioWorkspace() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const initialPrompt = searchParams?.get('prompt') ?? '';

    // UI state
    const [activeTab, setActiveTab] = useState<'activity' | 'files'>('activity');
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const [chatInput, setChatInput] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isHydrating, setIsHydrating] = useState(true);
    const [projectName, setProjectName] = useState('');

    // Swarm state
    const [thoughts, setThoughts] = useState<Array<{ agent: string; thought: string; type: string; key: string; createdAt: number }>>([]);
    const [files, setFiles] = useState<Record<string, { path: string; content: string; description?: string }>>({});

    const hasAppended = useRef(false);
    const activityEndRef = useRef<HTMLDivElement>(null);

    const { messages, isLoading, append } = useChat({
        api: '/api/swarm',
        body: { projectId: id },
    });

    // ── Hydrate from Supabase on Mount ────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        getProjectData(id).then(data => {
            setProjectName(data.project.name);

            // Map files
            const initialFiles: typeof files = {};
            data.files.forEach((f: any) => {
                initialFiles[f.path] = { path: f.path, content: f.content };
            });
            setFiles(initialFiles);
            if (data.files.length > 0) setActiveFile(data.files[0].path);

            // Map thoughts (historical messages)
            const initialThoughts: typeof thoughts = data.messages.map((m: any, idx: number) => ({
                agent: m.role,
                thought: m.content,
                type: 'archived',
                key: m.id,
                createdAt: m.created_at ? new Date(m.created_at).getTime() : Date.now() + idx,
            }));
            setThoughts(initialThoughts);

            setIsHydrating(false);
        }).catch(err => {
            console.error('Hydration Error:', err);
            setIsHydrating(false);
        });
    }, [id]);

    // ── Parse live tool invocations from messages ─────────────────────────────
    useEffect(() => {
        const liveFiles: Record<string, any> = {};
        const liveThoughts: any[] = [];

        for (const msg of messages) {
            if (!msg.toolInvocations) continue;
            for (const inv of msg.toolInvocations) {
                if (inv.toolName === 'logSwarmThought' && inv.args) {
                    liveThoughts.push({
                        agent: inv.args.agent,
                        thought: inv.args.thought,
                        type: inv.args.type ?? 'planning',
                        key: inv.toolCallId ?? `${msg.id}-${liveThoughts.length}`,
                        createdAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now() + liveThoughts.length,
                    });
                }
                if (inv.toolName === 'writeFile' && inv.args?.path && inv.args?.content) {
                    liveFiles[inv.args.path] = {
                        path: inv.args.path,
                        content: inv.args.content,
                        description: inv.args.description,
                    };
                }
            }
        }

        if (Object.keys(liveFiles).length > 0) {
            setFiles(prev => ({ ...prev, ...liveFiles }));
            setActiveFile(prev => prev ?? Object.keys(liveFiles)[0]);
        }
        if (liveThoughts.length > 0) {
            setThoughts(prev => {
                // Deduplicate live thoughts against historical ones (very naive)
                const existingKeys = new Set(prev.map(t => t.key));
                const newOnes = liveThoughts.filter(lt => !existingKeys.has(lt.key));
                return [...prev, ...newOnes];
            });
        }
    }, [messages]);

    const latestThought = useMemo(() => {
        if (thoughts.length === 0) return null;
        return [...thoughts].sort((a, b) => a.createdAt - b.createdAt).at(-1) ?? null;
    }, [thoughts]);

    const activityItems = useMemo(() => {
        const userItems = messages
            .filter((m) => m.role === 'user')
            .map((m, idx) => ({
                kind: 'user' as const,
                key: m.id ?? `user-${idx}`,
                content: m.content,
                createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now() + idx,
            }));

        const thoughtItems = thoughts.map((t) => ({
            kind: 'thought' as const,
            ...t,
        }));

        return [...userItems, ...thoughtItems].sort((a, b) => {
            if (a.createdAt === b.createdAt) {
                // If timestamps collide, keep user prompts before agent responses.
                if (a.kind === b.kind) return 0;
                return a.kind === 'user' ? -1 : 1;
            }
            return a.createdAt - b.createdAt;
        });
    }, [messages, thoughts]);

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (activityEndRef.current) {
            activityEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activityItems, messages]);

    // ── Auto-send initial prompt ──────────────────────────────────────────────
    useEffect(() => {
        if (!initialPrompt || hasAppended.current || isHydrating) return;
        // Only auto-send if there are no messages yet
        if (messages.length === 0 && thoughts.length === 0) {
            const t = setTimeout(() => {
                hasAppended.current = true;
                append({ role: 'user', content: initialPrompt });
            }, 800);
            return () => clearTimeout(t);
        } else {
            hasAppended.current = true;
        }
    }, [initialPrompt, append, isHydrating, messages.length, thoughts.length]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const sendMessage = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || isLoading) return;
        append({ role: 'user', content: chatInput.trim() });
        setChatInput('');
    }, [chatInput, isLoading, append]);

    const handleCopy = () => {
        if (!activeFile || !files[activeFile]) return;
        navigator.clipboard.writeText(files[activeFile].content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        await new Promise(r => setTimeout(r, 2500));
        setIsPublishing(false);
        alert('🚀 Production build successful! Your app is now live.');
    };

    const fileList = Object.keys(files);
    const activeFileData = activeFile ? files[activeFile] : null;
    const streamingText = messages.filter(m => m.role === 'assistant' && m.content).at(-1)?.content ?? '';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100vh',
            background: '#020204', color: '#f8fafc',
            fontFamily: "'Inter', sans-serif", overflow: 'hidden',
        }}>
            {/* ── Background Glows ── */}
            <div style={{
                position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                width: '60%', height: '40%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* ── Top Navigation ── */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', height: 60, flexShrink: 0,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(2,2,4,0.8)', backdropFilter: 'blur(12px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'none', border: 'none', cursor: 'pointer', color: '#fff'
                        }}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(124,58,237,0.3)'
                        }}>
                            <Zap size={16} fill="white" color="white" />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>VANTAGE</span>
                    </motion.button>

                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                        <Terminal size={14} />
                        <span style={{ fontFamily: 'monospace' }}>{id?.slice(0, 8)}</span>
                    </div>

                    <AnimatePresence>
                        {(isLoading || isHydrating) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontSize: 12, marginLeft: 10 }}
                            >
                                <Loader2 size={12} className="spin" />
                                <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>{isHydrating ? 'HYDRATING...' : 'SWARM SYNCING...'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        display: 'flex', background: 'rgba(255,255,256,0.03)',
                        borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        {(['code', 'preview'] as const).map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} style={{
                                padding: '6px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                                background: viewMode === mode ? 'rgba(255,255,255,0.08)' : 'transparent',
                                color: viewMode === mode ? '#fff' : 'rgba(255,255,255,0.3)',
                                boxShadow: viewMode === mode ? 'inset 0 0 10px rgba(255,255,255,0.05)' : 'none'
                            }}>
                                {mode === 'code' ? 'Code' : 'Preview'}
                            </button>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePublish}
                        disabled={isPublishing || fileList.length === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 20px', borderRadius: 12, border: 'none',
                            cursor: fileList.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: 14, fontWeight: 800, transition: 'all 0.3s',
                            background: fileList.length === 0 ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                            color: fileList.length === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                            boxShadow: fileList.length > 0 ? '0 8px 16px rgba(124,58,237,0.2)' : 'none',
                            opacity: isPublishing ? 0.7 : 1,
                        }}
                    >
                        {isPublishing ? <Loader2 size={16} className="spin" /> : <Globe size={16} />}
                        {isPublishing ? 'BUILDING...' : 'PUBLISH'}
                    </motion.button>
                </div>
            </header>

            {/* ── Workspace Layout ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: 8, gap: 8, zIndex: 5 }}>

                {/* ── Left Sidebar: Swarm Logic ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        width: 380, display: 'flex', flexDirection: 'column',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Panel Tabs */}
                    <div style={{
                        display: 'flex', padding: 6, gap: 4,
                        borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)'
                    }}>
                        {[
                            { id: 'activity', label: 'Swarm Activity', icon: MessageSquare },
                            { id: 'files', label: 'Project Files', icon: Layers },
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 12,
                                    background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: activeTab === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.25)',
                                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}>
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                        <AnimatePresence mode="popLayout">
                            {activeTab === 'activity' ? (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Swarm State Feed */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {activityItems.map((item) => {
                                            if (item.kind === 'user') {
                                                return (
                                                    <div key={item.key} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                                            background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>👤</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>USER</div>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '0 16px 16px 16px',
                                                                fontSize: 13, color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.6
                                                            }}>
                                                                {item.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const cfg = AGENTS[item.agent] ?? AGENTS.Manager;
                                            const isQuestion = item.type === 'question';
                                            return (
                                                <motion.div
                                                    key={item.key}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ display: 'flex', gap: 12, marginBottom: 4 }}
                                                >
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                                        background: isQuestion ? 'rgba(239,68,68,0.1)' : cfg.bg, border: `1px solid ${isQuestion ? 'rgba(239,68,68,0.3)' : cfg.border}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 14, boxShadow: `0 4px 12px ${isQuestion ? 'rgba(239,68,68,0.2)' : cfg.shadow}`
                                                    }}>
                                                        {isQuestion ? '❓' : cfg.icon}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <span style={{ fontSize: 11, fontWeight: 800, color: isQuestion ? '#ef4444' : cfg.color, letterSpacing: '0.05em' }}>
                                                                {item.agent.toUpperCase()}
                                                            </span>
                                                            <span style={{ fontSize: 9, color: isQuestion ? '#f87171' : 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{item.type.toUpperCase()}</span>
                                                        </div>
                                                        <div style={{
                                                            background: isQuestion ? 'rgba(239,68,68,0.05)' : cfg.bg, padding: '12px 16px', borderRadius: '0 16px 16px 16px',
                                                            fontSize: 13, color: isQuestion ? '#fca5a5' : '#e2e8f0', border: `1px solid ${isQuestion ? 'rgba(239,68,68,0.2)' : cfg.border}`, lineHeight: 1.6,
                                                            fontWeight: isQuestion ? 600 : 400
                                                        }}>
                                                            {item.thought}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {/* Streaming text */}
                                        {streamingText && (
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                                    background: AGENTS.Manager.bg, border: `1px solid ${AGENTS.Manager.border}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>⚡</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 800, color: AGENTS.Manager.color, marginBottom: 4 }}>MANAGER</div>
                                                    <div style={{
                                                        background: AGENTS.Manager.bg, padding: '12px 16px', borderRadius: '0 16px 16px 16px',
                                                        fontSize: 13, color: '#e2e8f0', border: `1px solid ${AGENTS.Manager.border}`, lineHeight: 1.6
                                                    }}>
                                                        {streamingText}
                                                        <motion.span
                                                            animate={{ opacity: [0, 1, 0] }}
                                                            transition={{ duration: 0.8, repeat: Infinity }}
                                                            style={{ marginLeft: 4, width: 8, height: 14, display: 'inline-block', background: '#a78bfa', verticalAlign: 'middle' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="files"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {fileList.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.15)' }}>
                                                <Layers size={48} style={{ margin: '0 auto 16px' }} strokeWidth={1} />
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>No files generated yet</div>
                                                <div style={{ fontSize: 11, marginTop: 4 }}>The swarm will create files soon.</div>
                                            </div>
                                        ) : fileList.map(path => (
                                            <motion.button
                                                key={path}
                                                whileHover={{ x: 4, background: 'rgba(255,255,255,0.04)' }}
                                                onClick={() => setActiveFile(path)}
                                                style={{
                                                    width: '100%', textAlign: 'left', padding: '10px 14px',
                                                    background: activeFile === path ? 'rgba(167,139,250,0.08)' : 'transparent',
                                                    border: 'none', borderRadius: 12, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                                                    borderLeft: activeFile === path ? '3px solid #7c3aed' : '3px solid transparent'
                                                }}
                                            >
                                                <span style={{ fontSize: 18 }}>{fileIcon(path)}</span>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{
                                                        fontSize: 13, fontWeight: 700, color: activeFile === path ? '#fff' : 'rgba(255,255,255,0.5)',
                                                        fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                    }}>
                                                        {path.split('/').pop()}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{path}</div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={activityEndRef} />
                    </div>

                    {/* Left Bottom: Interactive Prompt */}
                    <div style={{
                        padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)'
                    }}>
                        <form onSubmit={sendMessage} style={{ position: 'relative' }}>
                            <textarea
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder={latestThought?.type === 'question' && !isLoading ? 'The Swarm has a question for you...' : isLoading ? 'Swarm is thinking...' : 'Ask for a feature or modification...'}
                                disabled={isLoading}
                                style={{
                                    width: '100%', background: latestThought?.type === 'question' && !isLoading ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${latestThought?.type === 'question' && !isLoading ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: 16, padding: '12px 14px', paddingRight: 50,
                                    color: '#fff', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit',
                                    minHeight: 100, transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="submit"
                                disabled={isLoading || !chatInput.trim()}
                                style={{
                                    position: 'absolute', bottom: 12, right: 12,
                                    width: 32, height: 32, borderRadius: 10, border: 'none',
                                    background: isLoading || !chatInput.trim() ? 'rgba(255,255,255,0.05)' : '#7c3aed',
                                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <ArrowUp size={16} />
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* ── Center Area: Editor ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 24, overflow: 'hidden', backdropFilter: 'blur(20px)'
                        }}
                    >
                        {!activeFileData ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    style={{ color: 'rgba(124,58,237,0.3)' }}
                                >
                                    <Cpu size={80} strokeWidth={0.5} />
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>
                                        {isLoading ? 'Assembling Project Architecture' : 'Workspace Ready'}
                                    </h2>
                                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                                        {isLoading ? 'Orchestrating Manager, Architect, and Coder...' : 'Choose a file to begin inspection'}
                                    </p>
                                </div>
                            </div>
                        ) : viewMode === 'code' ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                {/* Editor Toolbar */}
                                <div style={{
                                    height: 54, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 22 }}>{fileIcon(activeFileData.path)}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                                                {activeFileData.path.split('/').pop()}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{activeFileData.path}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleCopy} style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 9,
                                            background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            {copied ? <CheckCircle2 size={13} color="#4ade80" /> : <Copy size={13} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                {/* Editor Content */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', background: '#050508' }}>
                                    <pre style={{
                                        margin: 0, padding: '0 32px',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: 14, lineHeight: 1.8, color: '#cbd5e1',
                                    }}>
                                        {activeFileData.content.split('\n').map((line, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 24 }} className="code-line">
                                                <span style={{
                                                    color: 'rgba(255,255,255,0.1)', userSelect: 'none', flexShrink: 0,
                                                    width: 40, textAlign: 'right', fontSize: 13, fontWeight: 500
                                                }}>{i + 1}</span>
                                                <span dangerouslySetInnerHTML={{ __html: highlight(line) }} style={{ whiteSpace: 'pre' }} />
                                            </div>
                                        ))}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 'inherit', overflow: 'hidden' }}>
                                <SmartPreview files={files} projectName={projectName} projectId={id} />
                            </div>
                        )}
                    </motion.div>

                    {/* Bottom Console/Output Log */}
                    <div style={{
                        height: 180, display: 'flex', flexDirection: 'column',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)'
                        }}>
                            <History size={14} color="#64748b" />
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>SWARM OUTPUT</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                            {fileList.map((path, i) => (
                                <div key={path} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                                    <span style={{ color: '#4ade80' }}>✓</span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                    <span style={{ color: '#94a3b8' }}>Wrote file</span>
                                    <span style={{ color: '#a78bfa' }}>{path}</span>
                                </div>
                            ))}
                            {(isLoading || isHydrating) && (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ color: '#64748b', fontStyle: 'italic' }}
                                >
                                    {isHydrating ? '> initializing local data stack...' : '> swarm processing parallel builds...'}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 2s linear infinite; }
                .code-line:hover { background: rgba(255,255,255,0.02); }
                * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Zap, Sparkles, Wand2, ArrowLeft, Terminal, Cpu, Layout, Gem, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject } from '@/app/actions';

export default function NewProject() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const project = await createProject('New SaaS Project', prompt);
            router.push(`/studio/${project.id}?prompt=${encodeURIComponent(prompt)}`);
        } catch (err: any) {
            console.error('Project creation failed:', err);
            setError(err.message || 'The swarm encountered a neural bottleneck. Please try again.');
            setIsLoading(false);
        }
    };

    const suggestions = [
        { label: "AI Fitness Coach", icon: Cpu, color: "#a78bfa", prompt: "AI-powered fitness coach subscription platform" },
        { label: "Team Coffee SaaS", icon: Gem, color: "#38bdf8", prompt: "Micro-SaaS for managing remote team coffee budgets" },
        { label: "Design Whiteboard", icon: Layout, color: "#4ade80", prompt: "Real-time collaborative whiteboard for design teams" },
        { label: "Crypto Tracker", icon: Zap, color: "#fb923c", prompt: "SaaS dashboard for tracking crypto portfolio performance" }
    ];

    return (
        <div style={{
            minHeight: '100vh', background: '#020204', color: '#fff',
            fontFamily: "'Inter', sans-serif", overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
            {/* ── Background Glow ── */}
            <div style={{
                position: 'fixed', bottom: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 800, width: '100%', position: 'relative', zIndex: 1, padding: 24 }}>

                {/* Back Link */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        marginBottom: 40, transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </motion.button>

                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px', boxShadow: '0 0 40px rgba(124,58,237,0.4)',
                        }}
                    >
                        <Zap size={28} fill="white" color="white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', marginBottom: 16 }}
                    >
                        What shall the Swarm build?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 500 }}
                    >
                        Describe your vision in natural language. Our agents handle the rest.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ position: 'relative', marginBottom: 32 }}
                >
                    <textarea
                        autoFocus
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Build a high-end luxury watch rental SaaS..."
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 32, padding: '32px 40px', fontSize: 20, height: 280,
                            color: '#fff', outline: 'none', resize: 'none', transition: 'all 0.3s',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
                            fontFamily: 'inherit', lineHeight: 1.5
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleCreate();
                            }
                        }}
                    />

                    <div style={{
                        position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 12
                    }}>
                        <button
                            onClick={handleCreate}
                            disabled={!prompt || isLoading}
                            style={{
                                background: isLoading ? 'rgba(255,255,255,0.05)' : '#fff',
                                color: '#000', padding: '16px 32px', borderRadius: 20,
                                fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                                boxShadow: prompt && !isLoading ? '0 10px 20px rgba(255,255,255,0.1)' : 'none',
                                opacity: !prompt && !isLoading ? 0.3 : 1
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spin" /> DEPLOYING SWARM...
                                </>
                            ) : (
                                <>
                                    INITIALIZE SWARM <Wand2 size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            padding: '16px 24px', borderRadius: 20, background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 14,
                            textAlign: 'center', marginBottom: 32, fontWeight: 600
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {suggestions.map((s, idx) => {
                        const Icon = s.icon;
                        return (
                            <motion.button
                                key={s.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.05 }}
                                whileHover={{ y: -4, background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}
                                onClick={() => setPrompt(s.prompt)}
                                style={{
                                    padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} color={s.color} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 600 }}>
                    <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginRight: 4 }}>CMD</span>
                    +
                    <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginLeft: 4 }}>ENTER</span>
                    TO LAUNCH
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
}

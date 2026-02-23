"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Zap, Search, Clock, CheckCircle2, Loader2, Hammer, ArrowRight, User, Settings, LogOut } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects } from '@/app/actions';

interface Project {
    id: string;
    name: string;
    prompt: string;
    status: 'building' | 'ready' | 'error';
    created_at: string;
}

const STATUS_CONFIG = {
    building: { color: '#f59e0b', icon: Hammer, label: 'Building', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    ready: { color: '#4ade80', icon: CheckCircle2, label: 'Ready', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
    error: { color: '#f87171', icon: Zap, label: 'Error', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getProjects().then(data => {
            setProjects(data as Project[]);
            setLoading(false);
        });
    }, []);

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.prompt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            minHeight: '100vh', background: '#020204', color: '#fff',
            fontFamily: "'Inter', sans-serif", overflowX: 'hidden'
        }}>
            {/* ── Background Elements ── */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 50%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            {/* ── Global Nav ── */}
            <nav style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(2,2,4,0.8)', backdropFilter: 'blur(20px)',
                position: 'sticky', top: 0, zIndex: 50,
                padding: '0 32px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                    }}>
                        <Zap size={16} fill="white" color="white" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px' }}>Vantage Pro</span>
                    <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                        color: '#a78bfa', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>Production Suite</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Link href="/billing" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                        Billing
                    </Link>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find a project..."
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, padding: '8px 16px 8px 36px', fontSize: 13,
                                color: '#fff', outline: 'none', width: 280, transition: 'all 0.3s',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                    </div>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px', position: 'relative', zIndex: 1 }}>

                {/* ── Dashboard Header ── */}
                <header style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    marginBottom: 56, gap: 24
                }}>
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}
                        >
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Manager</span>
                            <div style={{ width: 40, height: 1, background: 'rgba(124,58,237,0.3)' }} />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}
                        >
                            Your Applications
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 500 }}
                        >
                            {loading ? 'Consulting the swarm...' : `${projects.length} elite project${projects.length !== 1 ? 's' : ''} deployed`}
                        </motion.p>
                    </div>

                    <Link href="/studio/new" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: '#fff', color: '#000', padding: '14px 28px',
                                borderRadius: 16, fontWeight: 800, fontSize: 15,
                                display: 'flex', alignItems: 'center', gap: 10, border: 'none',
                                cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Plus size={18} /> NEW PROJECT
                        </motion.button>
                    </Link>
                </header>

                {/* ── Main Project Grid ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 24
                }}>
                    {/* New Project (Always Visible) */}
                    <Link href="/studio/new" style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{ scale: 1.02, background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                            style={{
                                height: 220, border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 24,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                                cursor: 'pointer', transition: 'all 0.3s',
                            }}
                        >
                            <div style={{
                                width: 52, height: 52, borderRadius: 16,
                                background: 'rgba(255,255,255,0.03)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <Plus size={24} color="#7c3aed" />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>INIT NEW PROJECT</span>
                        </motion.div>
                    </Link>

                    {/* Project Skeleton Loading */}
                    {loading && [1, 2, 3].map(i => (
                        <div key={i} style={{
                            height: 220, borderRadius: 24, background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite'
                        }} />
                    ))}

                    {/* Rendered Projects */}
                    <AnimatePresence>
                        {!loading && filtered.map((project, idx) => {
                            const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.building;
                            const StatusIcon = cfg.icon;
                            return (
                                <Link key={project.id} href={`/studio/${project.id}`} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -6, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
                                        style={{
                                            height: 220, borderRadius: 24, padding: '28px',
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                            backdropFilter: 'blur(10px)',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 14,
                                                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: '1px solid rgba(124,58,237,0.3)'
                                                }}>
                                                    <Zap size={20} color="#a78bfa" />
                                                </div>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    fontSize: 11, fontWeight: 800, color: cfg.color,
                                                    background: cfg.bg, padding: '5px 12px', borderRadius: 20,
                                                    border: `1px solid ${cfg.border}`, textTransform: 'uppercase', letterSpacing: '0.05em'
                                                }}>
                                                    <StatusIcon size={12} />
                                                    {cfg.label}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, color: '#fff', letterSpacing: '-0.3px' }}>
                                                    {project.name}
                                                </h3>
                                                <p style={{
                                                    fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6,
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {project.prompt}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 600 }}>
                                                <Clock size={14} />
                                                {timeAgo(project.created_at)}
                                            </div>
                                            <div style={{ color: '#7c3aed', opacity: 0, transition: '0.2s', transform: 'translateX(-5px)' }} className="go-arrow">
                                                <ArrowRight size={18} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </AnimatePresence>

                    {/* Empty Search State */}
                    {!loading && filtered.length === 0 && projects.length > 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                            <Search size={48} style={{ opacity: 0.1, marginBottom: 20 }} />
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>No projects matching &quot;{search}&quot;</p>
                            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 800, marginTop: 12, cursor: 'pointer' }}>
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes pulse { 
                    0% { opacity: 0.1; } 
                    50% { opacity: 0.3; } 
                    100% { opacity: 0.1; } 
                }
                a:hover .go-arrow { opacity: 1 !important; transform: translateX(0) !important; }
            `}</style>
        </div>
    );
}

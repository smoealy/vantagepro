"use client";

import React from 'react';
import { Zap, Shield, Rocket, Cpu, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-10 py-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black shadow-lg">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase whitespace-nowrap">
                        Vantage <span className="opacity-40">Pro</span>
                    </span>
                </div>

                <div className="flex items-center gap-8">
                    <SignedIn>
                        <Link href="/dashboard" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">Dashboard</Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">Sign In</button>
                        </SignInButton>
                    </SignedOut>
                    <Link href="/dashboard">
                        <button className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 uppercase tracking-widest">
                            Get Started
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <main className="relative pt-40 pb-20 px-10 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Vantage Pro v1.0 is Live</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
                    Build SaaS Products <br /> At the Speed of Thought.
                </h1>

                <p className="max-w-2xl text-xl text-white/40 mb-12 leading-relaxed font-medium">
                    The world's most advanced multi-agent development studio.
                    Deploy enterprise-grade apps in minutes with our persistent,
                    streaming swarm intelligence.
                </p>

                <div className="flex gap-4">
                    <Link href="/dashboard">
                        <button className="group bg-white text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-purple-500 hover:text-white transition-all shadow-2xl shadow-white/10 active:scale-[0.98]">
                            Start Building Now
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
                    {[
                        { icon: Shield, title: "Enterprise Persistence", desc: "Every project, message, and file is saved for life in your own Supabase instance." },
                        { icon: Cpu, title: "Streaming Intelligence", desc: "Watch Architect, Coder, and Designer build your vision in real-time, token by token." },
                        { icon: Globe, title: "One-Click Deploy", desc: "Integrated Vercel and Netlify workflows for instant production scaling." }
                    ].map((f, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-left hover:border-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-500/10 transition-colors">
                                <f.icon className="text-white/40 group-hover:text-purple-400 transition-colors" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-white/30 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 px-10 py-20 bg-[#050505]/50 backdrop-blur-3xl mt-20 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-4 opacity-40">
                    <Zap size={20} />
                    <span className="font-bold uppercase tracking-widest text-xs">A Product by Antigravity Studio</span>
                </div>
                <div className="flex gap-10 text-xs font-bold text-white/20 uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                    <a href="#" className="hover:text-white transition-colors">API Reference</a>
                    <a href="#" className="hover:text-white transition-colors">Status</a>
                </div>
            </footer>
        </div>
    );
}

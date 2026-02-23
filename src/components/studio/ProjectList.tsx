"use client";

import React from 'react';
import { Folder, MoreVertical, Clock } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    updated_at: string;
}

interface ProjectListProps {
    projects: Project[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <Link
                    key={project.id}
                    href={`/studio/${project.id}`}
                    className="group h-64 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/5 transition-all text-left"
                >
                    <div className="flex justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                            <Folder className="text-white/60" size={20} />
                        </div>
                        <button className="p-2 text-white/20 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                            <MoreVertical size={18} />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">{project.name}</h3>
                        <p className="text-sm text-white/30 line-clamp-2">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <Clock size={12} />
                            {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                        <div className="ml-auto flex -space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-black">A</div>
                            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-black">C</div>
                            <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-black">D</div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createProject(name: string, prompt: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Upsert profile (lazy creation)
    await supabaseAdmin.from('profiles').upsert({
        clerk_id: userId,
        email: (sessionClaims as any)?.email ?? 'user@vantage.ai',
        full_name: (sessionClaims as any)?.full_name ?? 'Vantage User',
    }, { onConflict: 'clerk_id' });

    const { data, error } = await supabaseAdmin
        .from('projects')
        .insert({ name, prompt, user_id: userId, status: 'building' })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getProjects() {
    const { userId } = await auth();
    if (!userId) return [];

    const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data ?? [];
}

export async function getProjectData(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch project metadata
    const { data: project } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (!project) throw new Error("Project not found");

    // Fetch files
    const { data: files } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('project_id', id);

    // Fetch messages (thoughts)
    const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

    return { project, files: files ?? [], messages: messages ?? [] };
}

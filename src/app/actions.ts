"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureBillingAccount } from '@/lib/billing/service';

export async function createProject(name: string, prompt: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const supabaseAdmin = getSupabaseAdmin();

    const trimmedName = name.trim();
    const trimmedPrompt = prompt.trim();
    if (!trimmedName) throw new Error('Project name is required');
    if (!trimmedPrompt) throw new Error('Project prompt is required');

    // Upsert profile (lazy creation)
    await supabaseAdmin.from('profiles').upsert({
        clerk_id: userId,
        email: (sessionClaims as any)?.email ?? 'user@vantage.ai',
        full_name: (sessionClaims as any)?.full_name ?? 'Vantage User',
    }, { onConflict: 'clerk_id' });

    await ensureBillingAccount(userId);

    const { data, error } = await supabaseAdmin
        .from('projects')
        .insert({ name: trimmedName, prompt: trimmedPrompt, user_id: userId, status: 'building' })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getProjects() {
    const { userId } = await auth();
    if (!userId) return [];
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch projects:', error.message);
        return [];
    }
    return data ?? [];
}

export async function getBillingOverview() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return ensureBillingAccount(userId);
}

export async function getProjectData(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch project metadata
    const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (projectError) {
        throw new Error(projectError.message);
    }

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

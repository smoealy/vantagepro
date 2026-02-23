import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { plans } from '@/lib/billing/plans';

export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

export type BillingAccount = {
    id: string;
    user_id: string;
    plan_id: PlanId;
    credit_balance: number;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
};

const FREE_PLAN = plans.find((plan) => plan.id === 'free');

if (!FREE_PLAN) {
    throw new Error('Free plan missing from billing configuration');
}

const DEFAULT_FREE_CREDITS = FREE_PLAN.includedCredits;

export async function getBillingAccount(userId: string): Promise<BillingAccount | null> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('billing_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;
    return data as BillingAccount;
}

export async function ensureBillingAccount(userId: string): Promise<BillingAccount> {
    const existing = await getBillingAccount(userId);
    if (existing) return existing;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('billing_accounts')
        .insert({
            user_id: userId,
            plan_id: 'free',
            credit_balance: DEFAULT_FREE_CREDITS,
            subscription_status: 'free',
        })
        .select('*')
        .single();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create billing account');
    }

    return data as BillingAccount;
}

export async function consumeCredits(params: {
    userId: string;
    amount: number;
    reason: string;
    projectId?: string | null;
}): Promise<{ ok: true; remaining: number } | { ok: false; remaining: number }> {
    const account = await ensureBillingAccount(params.userId);

    if (account.credit_balance < params.amount) {
        return { ok: false, remaining: account.credit_balance };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const nextBalance = account.credit_balance - params.amount;

    const { error: updateError } = await supabaseAdmin
        .from('billing_accounts')
        .update({ credit_balance: nextBalance })
        .eq('id', account.id);

    if (updateError) {
        throw new Error(updateError.message);
    }

    const { error: ledgerError } = await supabaseAdmin.from('credit_ledger').insert({
        user_id: params.userId,
        project_id: params.projectId ?? null,
        delta: -params.amount,
        reason: params.reason,
    });

    if (ledgerError) {
        throw new Error(ledgerError.message);
    }

    return { ok: true, remaining: nextBalance };
}

export async function grantCredits(params: {
    userId: string;
    amount: number;
    reason: string;
}): Promise<void> {
    const account = await ensureBillingAccount(params.userId);
    const supabaseAdmin = getSupabaseAdmin();
    const nextBalance = account.credit_balance + params.amount;

    const { error: updateError } = await supabaseAdmin
        .from('billing_accounts')
        .update({ credit_balance: nextBalance })
        .eq('id', account.id);

    if (updateError) {
        throw new Error(updateError.message);
    }

    const { error: ledgerError } = await supabaseAdmin.from('credit_ledger').insert({
        user_id: params.userId,
        delta: params.amount,
        reason: params.reason,
    });

    if (ledgerError) {
        throw new Error(ledgerError.message);
    }
}

export function includedCreditsForPlan(planId: PlanId): number {
    const plan = plans.find((entry) => entry.id === planId);
    return plan?.includedCredits ?? 0;
}

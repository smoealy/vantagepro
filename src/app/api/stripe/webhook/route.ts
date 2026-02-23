import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { includedCreditsForPlan } from '@/lib/billing/service';

export const runtime = 'nodejs';

function getPlanIdFromPriceId(priceId: string | null | undefined): 'pro' | 'team' | null {
    if (!priceId) return null;
    if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
        return 'pro';
    }
    if (priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY || priceId === process.env.STRIPE_PRICE_TEAM_YEARLY) {
        return 'team';
    }
    return null;
}

async function setCreditBalance(params: { userId: string; nextBalance: number; reason: string }) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: account, error: accountError } = await supabaseAdmin
        .from('billing_accounts')
        .select('id, credit_balance')
        .eq('user_id', params.userId)
        .single();

    if (accountError || !account) throw new Error(accountError?.message || 'Billing account not found');

    const delta = params.nextBalance - (account.credit_balance ?? 0);

    const { error: updateError } = await supabaseAdmin
        .from('billing_accounts')
        .update({ credit_balance: params.nextBalance })
        .eq('id', account.id);

    if (updateError) throw new Error(updateError.message);

    const { error: ledgerError } = await supabaseAdmin.from('credit_ledger').insert({
        user_id: params.userId,
        delta,
        reason: params.reason,
    });

    if (ledgerError) throw new Error(ledgerError.message);
}

async function handleSubscriptionUpdate(subscription: any) {
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const priceId = subscription.items.data[0]?.price?.id;
    const planId = getPlanIdFromPriceId(priceId);
    if (!planId) return;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: account } = await supabaseAdmin
        .from('billing_accounts')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!account?.user_id) return;

    const { error } = await supabaseAdmin
        .from('billing_accounts')
        .update({
            plan_id: planId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
        })
        .eq('user_id', account.user_id);

    if (error) throw new Error(error.message);
}

async function handleSubscriptionDeleted(subscription: any) {
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: account } = await supabaseAdmin
        .from('billing_accounts')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!account?.user_id) return;

    const { error } = await supabaseAdmin
        .from('billing_accounts')
        .update({
            plan_id: 'free',
            stripe_subscription_id: null,
            subscription_status: subscription.status,
        })
        .eq('user_id', account.user_id);

    if (error) throw new Error(error.message);
}

async function handleInvoicePaid(invoice: any) {
    const customerId =
        typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer && typeof invoice.customer === 'object'
                ? invoice.customer.id
                : null;

    if (!customerId) return;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: account } = await supabaseAdmin
        .from('billing_accounts')
        .select('user_id, plan_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!account?.user_id || !account.plan_id) return;

    const planCredits = includedCreditsForPlan(account.plan_id);
    await setCreditBalance({
        userId: account.user_id,
        nextBalance: planCredits,
        reason: `billing_cycle_reset:${account.plan_id}`,
    });
}

export async function POST(req: Request) {
    const stripe = getStripe();
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event: any;
    try {
        event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaid(event.data.object);
                break;
            default:
                break;
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getStripe, getAppUrl } from '@/lib/stripe/server';
import { getStripePriceId, type BillingInterval, type PlanId } from '@/lib/billing/plans';
import { ensureBillingAccount } from '@/lib/billing/service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const bodySchema = z.object({
    planId: z.enum(['pro', 'team']),
    interval: z.enum(['monthly', 'yearly']),
});

async function ensureStripeCustomer(params: {
    userId: string;
    existingCustomerId: string | null;
    email: string | undefined;
}) {
    if (params.existingCustomerId) return params.existingCustomerId;

    const stripe = getStripe();
    const customer = await stripe.customers.create({
        email: params.email,
        metadata: { userId: params.userId },
    });

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
        .from('billing_accounts')
        .update({ stripe_customer_id: customer.id })
        .eq('user_id', params.userId);

    if (error) throw new Error(error.message);
    return customer.id;
}

export async function POST(req: Request) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { planId, interval } = parsed.data as { planId: PlanId; interval: BillingInterval };
    const priceId = getStripePriceId(planId, interval);
    if (!priceId) {
        return NextResponse.json({ error: 'Price not configured for this plan' }, { status: 400 });
    }

    const billingAccount = await ensureBillingAccount(userId);
    const customerId = await ensureStripeCustomer({
        userId,
        existingCustomerId: billingAccount.stripe_customer_id,
        email: (sessionClaims as any)?.email,
    });

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/billing?status=success`,
        cancel_url: `${appUrl}/billing?status=cancelled`,
        metadata: {
            userId,
            planId,
            interval,
        },
        allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
}

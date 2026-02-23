import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripe, getAppUrl } from '@/lib/stripe/server';
import { ensureBillingAccount } from '@/lib/billing/service';

export async function POST() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const billingAccount = await ensureBillingAccount(userId);
    if (!billingAccount.stripe_customer_id) {
        return NextResponse.json({ error: 'No Stripe customer found for this user' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
        customer: billingAccount.stripe_customer_id,
        return_url: `${getAppUrl()}/billing`,
    });

    return NextResponse.json({ url: session.url });
}

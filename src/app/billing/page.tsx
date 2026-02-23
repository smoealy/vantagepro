import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import BillingClient from '@/components/billing/BillingClient';
import { ensureBillingAccount } from '@/lib/billing/service';

export default async function BillingPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }

    const account = await ensureBillingAccount(userId);

    return (
        <div style={{ minHeight: '100vh', background: '#050505' }}>
            <BillingClient currentPlanId={account.plan_id} creditBalance={account.credit_balance} />
        </div>
    );
}

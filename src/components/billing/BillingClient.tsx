"use client";

import { useState } from 'react';
import { plans, type BillingInterval } from '@/lib/billing/plans';

type Props = {
    currentPlanId: string;
    creditBalance: number;
};

export default function BillingClient({ currentPlanId, creditBalance }: Props) {
    const [interval, setInterval] = useState<BillingInterval>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function startCheckout(planId: 'pro' | 'team') {
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, interval }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Checkout failed');
            if (data.url) window.location.href = data.url;
        } catch (e: any) {
            setError(e.message || 'Checkout failed');
        } finally {
            setIsLoading(false);
        }
    }

    async function openPortal() {
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/billing/portal', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Portal failed');
            if (data.url) window.location.href = data.url;
        } catch (e: any) {
            setError(e.message || 'Portal failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px', color: '#fff' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Billing</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
                Current plan: <strong>{currentPlanId.toUpperCase()}</strong> · Credits remaining: <strong>{creditBalance}</strong>
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button
                    onClick={() => setInterval('monthly')}
                    style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: interval === 'monthly' ? '#fff' : 'transparent',
                        color: interval === 'monthly' ? '#000' : '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setInterval('yearly')}
                    style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: interval === 'yearly' ? '#fff' : 'transparent',
                        color: interval === 'yearly' ? '#000' : '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Yearly
                </button>
                <button
                    onClick={openPortal}
                    style={{
                        marginLeft: 'auto',
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'transparent',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Manage Subscription
                </button>
            </div>

            {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {plans
                    .filter((plan) => plan.id !== 'enterprise')
                    .map((plan) => (
                        <div
                            key={plan.id}
                            style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 14,
                                padding: 16,
                                background: 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{plan.name}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, minHeight: 40 }}>{plan.description}</p>
                            <p style={{ fontSize: 24, fontWeight: 900, margin: '10px 0' }}>
                                ${interval === 'yearly' ? plan.yearlyPriceUsd : plan.monthlyPriceUsd}
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>
                                    /{interval === 'yearly' ? 'mo billed yearly' : 'mo'}
                                </span>
                            </p>
                            <p style={{ fontSize: 13, marginBottom: 12 }}>Includes {plan.includedCredits} credits</p>
                            {plan.id === 'free' ? (
                                <button
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        background: 'transparent',
                                        color: 'rgba(255,255,255,0.6)',
                                    }}
                                >
                                    Free Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => startCheckout(plan.id === 'team' ? 'team' : 'pro')}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: '#fff',
                                        color: '#000',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {isLoading ? 'Loading...' : 'Upgrade'}
                                </button>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}

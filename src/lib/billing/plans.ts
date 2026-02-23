export type BillingInterval = 'monthly' | 'yearly';
export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  includedCredits: number;
  maxProjects: number;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try the product and ship your first generated app.',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    includedCredits: 25,
    maxProjects: 3,
    features: ['Core AI generation', 'Preview + code editing', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For solo founders shipping production apps weekly.',
    monthlyPriceUsd: 29,
    yearlyPriceUsd: 24,
    includedCredits: 400,
    maxProjects: 50,
    features: ['Priority model routing', 'More generation credits', 'Custom domains'],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For startups collaborating on multiple products.',
    monthlyPriceUsd: 99,
    yearlyPriceUsd: 79,
    includedCredits: 2000,
    maxProjects: 250,
    features: ['Shared workspaces', 'Role-based access', 'Usage analytics'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations with security and governance requirements.',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    includedCredits: 0,
    maxProjects: Number.MAX_SAFE_INTEGER,
    features: ['SSO/SAML', 'Audit logs', 'Dedicated support and SLA'],
  },
];

export function getPlanPrice(plan: Plan, interval: BillingInterval): number {
  return interval === 'yearly' ? plan.yearlyPriceUsd : plan.monthlyPriceUsd;
}

export function getStripePriceId(planId: PlanId, interval: BillingInterval): string | null {
  const map: Record<PlanId, { monthly?: string; yearly?: string }> = {
    free: {},
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    team: {
      monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY,
      yearly: process.env.STRIPE_PRICE_TEAM_YEARLY,
    },
    enterprise: {},
  };

  return map[planId][interval] ?? null;
}

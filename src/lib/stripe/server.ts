const Stripe = require('stripe');

let stripeClient: any = null;

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getStripeSecretKey() {
    return getRequiredEnv('STRIPE_SECRET_KEY');
}

export function getStripeWebhookSecret() {
    return getRequiredEnv('STRIPE_WEBHOOK_SECRET');
}

export function getAppUrl() {
    return getRequiredEnv('NEXT_PUBLIC_APP_URL');
}

export function getStripe() {
    if (stripeClient) return stripeClient;
    stripeClient = new Stripe(getStripeSecretKey(), {
        apiVersion: '2025-02-24.acacia',
    });
    return stripeClient;
}

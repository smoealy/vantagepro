import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ] as const;

  const missing = requiredEnv.filter((key) => !process.env[key]);

  return NextResponse.json(
    {
      status: missing.length === 0 ? 'ok' : 'degraded',
      missingEnv: missing,
      timestamp: new Date().toISOString(),
    },
    { status: missing.length === 0 ? 200 : 503 },
  );
}

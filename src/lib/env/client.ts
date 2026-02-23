const requiredClientEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

export function getClientEnv() {
  const missing = requiredClientEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required client environment variables: ${missing.join(', ')}`);
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}

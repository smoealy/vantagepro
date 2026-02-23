# Vantage Pro

AI product studio for generating and iterating on SaaS apps using multi-agent workflows.

## Production-ready local setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Fill required variables in `.env.local`:
- Clerk keys
- Supabase URL/anon/service role keys
- OpenAI API key

3. Install dependencies:

```bash
npm install --legacy-peer-deps
```

4. Run checks:

```bash
npm run check
```

5. Start app:

```bash
npm run dev
```

6. Verify health endpoint:

```bash
curl -s http://localhost:3000/api/health
```

## Monorepo/tooling notes

- This project uses Next.js App Router.
- Linting is pinned to an ESLint/Next-compatible stack in `package.json`.
- Type-check command: `npm run typecheck`.

## Revenue model (aligned with top AI app builders)

Recommended production monetization model:

- **Free**: limited credits and project count
- **Pro ($29/mo)**: higher credits + priority generation
- **Team ($99/mo)**: shared usage + collaboration
- **Enterprise**: annual contract, SSO, SLA

Reference plan configuration is in `src/lib/billing/plans.ts`.

### Suggested earning stack

1. Add Stripe subscriptions + webhooks for plan lifecycle.
2. Track credit usage per generation request.
3. Enforce limits at API boundary (`/api/swarm`) per plan.
4. Add overage/credit top-ups for usage-based expansion.
5. Add annual discounts and referral program for CAC efficiency.

## Security and reliability checklist

- ✅ Clerk auth required before project and swarm access.
- ✅ Project ownership check in swarm API before writes.
- ✅ Explicit required-env validation and health endpoint.
- ✅ Server-side Supabase service role isolated from client.

## Next hardening steps before public launch

- Add rate limiting (Upstash/Redis) for `/api/swarm`.
- Add idempotency keys for generation requests.
- Add structured logging + tracing (Sentry/OpenTelemetry).
- Add Stripe customer portal + invoice handling.
- Add e2e smoke tests (auth -> create -> generate -> follow-up edit).

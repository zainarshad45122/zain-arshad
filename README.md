# ai-gateway

Small NestJS + TypeORM + Postgres API for the GGI backend test. It has two parts: subscription bundles and a chat endpoint backed by a mocked OpenAI.

## Running it

Requires Docker and Node.

```bash
docker compose up -d
cp .env.example .env
npm install
npm run start:dev
```

Postgres comes up on 5432. TypeORM `synchronize` is on, so tables are created on boot and there's no migration step for local dev.

A test user (`test@example.com`) is seeded on first start. There's no auth, so its id needs to go in the request body. The id can be read from the `users` table once the app is up.

Health check: `GET /health`.

## Endpoints

Create a subscription:

```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -d '{ "userId": "<id>", "tier": "BASIC", "billingCycle": "MONTHLY", "autoRenew": true }'
```

Tiers are BASIC (10 messages), PRO (100) and ENTERPRISE (unlimited). Cycle is MONTHLY or YEARLY.

Toggle auto-renew:

```bash
curl -X PATCH http://localhost:3000/subscriptions/<id>/auto-renew \
  -H "Content-Type: application/json" \
  -d '{ "autoRenew": false }'
```

Cancel:

```bash
curl -X POST http://localhost:3000/subscriptions/<id>/cancel
```

Cancelling sets the status to CANCELLED and turns off auto-renew. Messages already paid for stay usable until the period ends.

Send a chat message:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{ "userId": "<id>", "question": "What is NestJS?" }'
```

The response is the stored message with the answer, token count and whether it came from the free tier or a bundle. When nothing is left it returns a 403 with a `QUOTA_EXCEEDED` error.

## Quota logic

Every user gets 3 free messages a month. There's no stored counter or reset job, the free messages created since the 1st of the current month are counted, so it resets on its own when the month changes.

After the free messages run out it falls back to subscriptions. When a user has more than one active bundle, the most recently created one with messages left is used. ("Latest remaining quota" in the test is a little vague; this is the reading used here.) Enterprise is unlimited so it never decrements.

## Billing

A cron runs once a day. It renews subscriptions that are due (auto-renew on, renewal date reached) and fails the payment about 20% of the time, marking those inactive. The same job also marks subscriptions inactive once their end date has passed but they're still active or cancelled, so the status stays accurate.

## Assumptions

- No auth was in scope, so userId is passed in the body.
- Quota is counted per message, not per token. Tokens are stored because the test asks for it but don't affect limits.
- Database access goes through repository classes instead of TypeORM calls in the services, to keep the layering the test asks for.
- The renewal cron runs inline in the app at high volume (e.g. tens of thousands due per day) this would be done in batches instead of one loop in a single process.

## Project structure

```
src/
  main.ts
  app.module.ts
  common/
    errors/
    filters/
    utils.ts
  modules/
    chat/
      entities/
      chat.controller.ts
      chat.service.ts
      chat.repository.ts
      mock-openai.service.ts
    subscriptions/
      entities/
      subscription.controller.ts
      subscription.service.ts
      subscription.repository.ts
      tiers.ts
    users/
      entities/
      users.seed.service.ts
```

The original test PDF is included as `GGI-Backend-Test-Posture.pdf`.

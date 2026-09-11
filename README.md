# Us.

A private, mobile-first space made specifically for Moez and Eliza.

## Run locally

Prerequisite: Node.js


1. Install dependencies with `npm install`.
2. Set the Supabase values in `.env`.
3. Generate a Web Push key pair with `npx web-push generate-vapid-keys`.
4. Put the public key in `VITE_VAPID_PUBLIC_KEY` and configure the private key in Supabase:
	`supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:notifications@example.com`
5. Run the database SQL in `supabase/setup.sql`, then deploy the function:
	`supabase functions deploy send-push`
6. Run the app with `npm run dev`.

Push notifications require HTTPS (or localhost), a deployed `send-push` function, and the VAPID secrets above. The recipient must enable notifications once on each device; subscriptions are stored in `push_subscriptions`.

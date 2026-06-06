/**
 * POST /api/stripe-webhook
 *
 * Listens for Stripe events. On a successful subscription:
 * 1. Generates a unique API key
 * 2. Stores it in Upstash Redis
 * 3. Emails the customer their key via Resend
 *
 * Environment variables needed (set in Vercel dashboard):
 *   STRIPE_WEBHOOK_SECRET     — from Stripe Dashboard > Webhooks
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *   RESEND_API_KEY
 *   YOUR_FROM_EMAIL           — e.g. keys@paginatejs.com (verified in Resend)
 */

import Stripe from 'stripe';

export const config = { runtime: 'nodejs' }; // Needs Node runtime for raw body

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const sig    = req.headers.get('stripe-signature') ?? '';
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    const rawBody = await req.text();

    // Verify the event came from Stripe (not a spoofed request)
    let event: Stripe.Event;
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
            apiVersion: '2024-06-20'
        });
        event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    // Only handle successful payments
    if (event.type !== 'checkout.session.completed' &&
        event.type !== 'invoice.payment_succeeded') {
        return new Response('Ignored', { status: 200 });
    }

    let customerEmail: string | null = null;
    let customerId: string | null = null;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.CheckoutSession;
        customerEmail = session.customer_details?.email ?? null;
        customerId    = session.customer as string;
    } else {
        const invoice = event.data.object as Stripe.Invoice;
        customerEmail = invoice.customer_email;
        customerId    = invoice.customer as string;
        // Skip if this key was already issued for this customer
        const existing = await getExistingKey(customerId);
        if (existing) {
            console.log('Key already issued for', customerId);
            return new Response('OK', { status: 200 });
        }
    }

    if (!customerEmail) {
        console.error('No customer email found in event');
        return new Response('No email', { status: 400 });
    }

    // Generate unique API key
    const apiKey = generateApiKey();

    // Store in Upstash Redis
    await storeKey(apiKey, { email: customerEmail, customerId, tier: 'pro', active: true, createdAt: new Date().toISOString() });

    // Also store reverse lookup: customerId → apiKey (so we can find existing keys)
    await storeCustomerKey(customerId, apiKey);

    // Email the key to the customer
    await sendKeyEmail(customerEmail, apiKey);

    console.log(`Issued key ${apiKey} to ${customerEmail}`);
    return new Response('OK', { status: 200 });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateApiKey(): string {
    // Format: pjs_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rand  = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => chars[b % chars.length])
        .join('');
    return `pjs_live_${rand}`;
}

async function redisSet(key: string, value: object): Promise<void> {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    await fetch(`${url}/set/${key}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(value)), // Upstash expects a JSON string as value
    });
}

async function redisGet(key: string): Promise<string | null> {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const res   = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const { result } = await res.json();
    return result ?? null;
}

async function storeKey(apiKey: string, record: object): Promise<void> {
    await redisSet(`apikey:${apiKey}`, record);
}

async function storeCustomerKey(customerId: string, apiKey: string): Promise<void> {
    await redisSet(`customer:${customerId}`, { apiKey });
}

async function getExistingKey(customerId: string): Promise<string | null> {
    const result = await redisGet(`customer:${customerId}`);
    if (!result) return null;
    const parsed = JSON.parse(result);
    return parsed.apiKey ?? null;
}

async function sendKeyEmail(email: string, apiKey: string): Promise<void> {
    const resendKey   = process.env.RESEND_API_KEY;
    const fromAddress = process.env.YOUR_FROM_EMAIL ?? 'keys@paginatejs.com';

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `PaginateJS <${fromAddress}>`,
            to: email,
            subject: 'Your PaginateJS Pro license key',
            html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
          <h2 style="margin-bottom:8px">You're on Pro 🎉</h2>
          <p style="color:#555">Thanks for subscribing to PaginateJS Pro. Here's your license key:</p>

          <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:24px 0;font-family:monospace;font-size:14px;word-break:break-all">
            ${apiKey}
          </div>

          <p style="color:#555">Add this to your app before calling <code>paginate()</code>:</p>

          <pre style="background:#1a1a2e;color:#a78bfa;padding:16px;border-radius:8px;font-size:13px;overflow-x:auto">import { init } from 'paginatejs/license';

// Call once at app startup
await init('${apiKey}');</pre>

          <p style="color:#555;margin-top:24px">
            Keep this key private — don't commit it to a public repo.<br>
            Questions? Reply to this email.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
          <p style="color:#999;font-size:12px">PaginateJS · paginatejs.com</p>
        </div>
      `,
        }),
    });
}
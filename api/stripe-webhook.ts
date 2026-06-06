/**
 * POST /api/stripe-webhook
 */

import Stripe from 'stripe';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const sig     = req.headers.get('stripe-signature') ?? '';
    const secret  = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
            apiVersion: '2026-05-27.dahlia' as any,
        });
        event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    if (
        event.type !== 'checkout.session.completed' &&
        event.type !== 'invoice.payment_succeeded'
    ) {
        return new Response('Ignored', { status: 200 });
    }

    let customerEmail: string | null = null;
    let customerId: string | null    = null;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        customerEmail = session.customer_details?.email ?? null;
        customerId    = session.customer as string;
    } else {
        const invoice = event.data.object as Stripe.Invoice;
        customerEmail = typeof invoice.customer_email === 'string'
            ? invoice.customer_email
            : null;
        customerId = invoice.customer as string;

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

    const apiKey = generateApiKey();
    await storeKey(apiKey, {
        email: customerEmail,
        customerId,
        tier: 'pro',
        active: true,
        createdAt: new Date().toISOString(),
    });
    await storeCustomerKey(customerId, apiKey);
    await sendKeyEmail(customerEmail, apiKey);

    console.log(`Issued key ${apiKey} to ${customerEmail}`);
    return new Response('OK', { status: 200 });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const rand  = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => chars[b % chars.length])
        .join('');
    return `pjs_live_${rand}`;
}

async function redisRequest(path: string, method = 'GET', body?: object) {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const res   = await fetch(`${url}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

async function storeKey(apiKey: string, record: object): Promise<void> {
    await redisRequest(
        `/set/apikey:${apiKey}`,
        'POST',
        JSON.stringify(record) as any
    );
}

async function storeCustomerKey(customerId: string, apiKey: string): Promise<void> {
    await redisRequest(
        `/set/customer:${customerId}`,
        'POST',
        JSON.stringify({ apiKey }) as any
    );
}

async function getExistingKey(customerId: string): Promise<string | null> {
    const { result } = await redisRequest(`/get/customer:${customerId}`);
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
          <h2>You're on Pro 🎉</h2>
          <p style="color:#555">Here's your license key:</p>
          <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:24px 0;font-family:monospace;font-size:14px;word-break:break-all">
            ${apiKey}
          </div>
          <p style="color:#555">Add this to your app:</p>
          <pre style="background:#1a1a2e;color:#a78bfa;padding:16px;border-radius:8px;font-size:13px">import { init } from 'paginatejs/license';
await init('${apiKey}');</pre>
          <p style="color:#999;font-size:12px;margin-top:32px">PaginateJS · paginatejs.com</p>
        </div>
      `,
        }),
    });
}
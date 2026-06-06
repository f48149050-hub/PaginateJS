/**
 * POST /api/validate
 *
 * Validates a PaginateJS license key.
 * Keys are stored in Upstash Redis as:
 *   key:   "apikey:pjs_live_xxxx"
 *   value: { email, tier, active, createdAt }
 *
 * Environment variables needed (set in Vercel dashboard):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
    // CORS — allow requests from any domain (your customers' sites)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers
        });
    }

    let key: string;
    try {
        const body = await req.json();
        key = body.key;
    } catch {
        return new Response(JSON.stringify({ valid: false, error: 'Invalid request body' }), {
            status: 400, headers
        });
    }

    if (!key || typeof key !== 'string' || !key.startsWith('pjs_')) {
        return new Response(JSON.stringify({ valid: false }), { status: 200, headers });
    }

    // Look up key in Upstash Redis via REST API
    const redisUrl  = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
        console.error('Missing Upstash env vars');
        return new Response(JSON.stringify({ valid: false, error: 'Server misconfigured' }), {
            status: 500, headers
        });
    }

    try {
        const redisRes = await fetch(`${redisUrl}/get/apikey:${key}`, {
            headers: { Authorization: `Bearer ${redisToken}` },
        });

        const { result } = await redisRes.json();

        if (!result) {
            // Key not found
            return new Response(JSON.stringify({ valid: false }), { status: 200, headers });
        }

        const record = JSON.parse(result);

        if (!record.active) {
            // Key exists but was deactivated (e.g. payment failed)
            return new Response(JSON.stringify({ valid: false, reason: 'inactive' }), {
                status: 200, headers
            });
        }

        return new Response(
            JSON.stringify({ valid: true, tier: record.tier }),
            { status: 200, headers }
        );
    } catch (err) {
        console.error('Redis lookup failed:', err);
        return new Response(JSON.stringify({ valid: false, error: 'Lookup failed' }), {
            status: 500, headers
        });
    }
}
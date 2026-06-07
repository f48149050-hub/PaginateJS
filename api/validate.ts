/**
 * POST /api/validate
 * Validates a PaginateJS license key against Upstash Redis.
 */

export const config = { runtime: 'edge' };

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export async function OPTIONS(): Promise<Response> {
    return new Response(null, { status: 204, headers });
}

export async function POST(req: Request): Promise<Response> {
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

    const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
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
            return new Response(JSON.stringify({ valid: false }), { status: 200, headers });
        }

        const record = JSON.parse(result);

        if (!record.active) {
            return new Response(JSON.stringify({ valid: false, reason: 'inactive' }), {
                status: 200, headers
            });
        }

        return new Response(JSON.stringify({ valid: true, tier: record.tier }), {
            status: 200, headers
        });

    } catch (err) {
        console.error('Redis lookup failed:', err);
        return new Response(JSON.stringify({ valid: false, error: 'Lookup failed' }), {
            status: 500, headers
        });
    }
}
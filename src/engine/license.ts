/**
 * PaginateJS License Module
 *
 * Free tier:  no key required, engine runs with a console warning
 * Pro tier:   call await init('pjs_live_...') before using paginate()
 */

// Change this to your deployed Vercel URL after deployment
const VALIDATION_URL = 'https://your-app.vercel.app/api/validate';

let _licenseState: 'unchecked' | 'valid' | 'invalid' = 'unchecked';
let _tier: 'free' | 'pro' = 'free';
let _warnedOnce = false;

/**
 * Call once at app startup with your Pro license key.
 * Free users can skip this.
 */
export async function init(apiKey: string): Promise<void> {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('[PaginateJS] init() requires a valid API key string.');
  }

  // Test keys bypass network validation (local dev)
  if (apiKey.startsWith('pjs_test_')) {
    _licenseState = 'valid';
    _tier = 'pro';
    console.log('[PaginateJS] Test key accepted — dev mode active.');
    return;
  }

  try {
    const res = await fetch(VALIDATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: apiKey }),
    });

    if (!res.ok) {
      throw new Error(`Validation server returned ${res.status}`);
    }

    const { valid, tier } = await res.json();

    if (!valid) {
      _licenseState = 'invalid';
      throw new Error(
          '[PaginateJS] Invalid license key. Get one at paginatejs.com/pricing'
      );
    }

    _licenseState = 'valid';
    _tier = tier ?? 'pro';

  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid license key')) {
      throw err;
    }
    // Network errors fall back to free tier
    console.warn('[PaginateJS] Could not reach validation server — running in free mode.');
    _licenseState = 'unchecked';
  }
}

/**
 * Called internally by paginate() before every run.
 * Free users: engine runs, commercial-use warning logged once.
 * Invalid key: throws immediately.
 */
export function assertLicense(): void {
  if (_licenseState === 'invalid') {
    throw new Error(
        '[PaginateJS] Invalid license key. Visit paginatejs.com/pricing'
    );
  }

  if (_licenseState === 'unchecked' && !_warnedOnce) {
    _warnedOnce = true;
    console.warn(
        '[PaginateJS] No license key detected. ' +
        'Free for personal/non-commercial use only. ' +
        'Commercial use requires a Pro license: paginatejs.com/pricing'
    );
  }
}

export function getLicenseState() {
  return { state: _licenseState, tier: _tier };
}
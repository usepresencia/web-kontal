import { kontalApiUrl } from '@/lib/config/env';
import 'server-only';
import { sessionSchema, type SessionBootstrap } from './schemas/session';

export type VerifyTokenResult =
    | { ok: true; session: SessionBootstrap }
    | { ok: false; reason: 'INVALID' | 'FORBIDDEN' | 'UNAVAILABLE' };

/** Valida um ID token do Firebase na api-kontal (`POST /auth/session`) sem usar os cookies. */
export async function verifyToken(token: string): Promise<VerifyTokenResult> {
    let response: Response;
    try {
        response = await fetch(`${kontalApiUrl()}/auth/session`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            cache: 'no-store',
        });
    } catch {
        return { ok: false, reason: 'UNAVAILABLE' };
    }

    if (response.status === 401) return { ok: false, reason: 'INVALID' };
    if (response.status === 403) return { ok: false, reason: 'FORBIDDEN' };
    if (!response.ok) return { ok: false, reason: 'UNAVAILABLE' };

    const parsed = sessionSchema.safeParse(await response.json().catch(() => null));
    return parsed.success
        ? { ok: true, session: parsed.data }
        : { ok: false, reason: 'UNAVAILABLE' };
}

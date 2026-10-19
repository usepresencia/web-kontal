import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Healthcheck do container: responde 200 enquanto o servidor Next está de pé. */
export function GET() {
    return NextResponse.json({ status: 'ok' });
}

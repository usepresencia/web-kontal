import { readTenantId } from '@/lib/auth/session-cookies';
import { redirect } from 'next/navigation';

export default async function RootPage() {
    redirect((await readTenantId()) ? '/home' : '/empresa');
}

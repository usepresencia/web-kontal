import { SITE } from '@/lib/config/site';
import type { Metadata } from 'next';

const OG_ALT = `${SITE.name} — ${SITE.description}`;

/** Metadados do layout raiz: título, compartilhamento (og e twitter) e bloqueio de indexação. */
export const rootMetadata: Metadata = {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    title: { default: SITE.name, template: `%s | ${SITE.name}` },
    description: SITE.description,
    // O app inteiro fica atrás do login: não há nada para indexar.
    robots: { index: false, follow: false },
    openGraph: {
        type: 'website',
        locale: SITE.locale,
        siteName: SITE.name,
        url: SITE.url,
        title: SITE.name,
        description: SITE.description,
        images: [{ ...SITE.ogImage, alt: OG_ALT }],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE.name,
        description: SITE.description,
        images: [{ url: SITE.ogImage.url, alt: OG_ALT }],
    },
};

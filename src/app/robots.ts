import { SITE } from '@/lib/config/site';
import type { MetadataRoute } from 'next';

/** Barra os buscadores (o app é privado) e libera só a imagem de compartilhamento. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: SITE.ogImage.url, disallow: '/' },
    };
}

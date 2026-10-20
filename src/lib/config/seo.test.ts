import robots from '@/app/robots';
import { rootMetadata } from '@/lib/config/metadata';
import { SITE } from '@/lib/config/site';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const metadata = rootMetadata;

describe('SEO do app privado', () => {
    it('não deixa nenhum buscador indexar', () => {
        expect(metadata.robots).toEqual({ index: false, follow: false });
        expect(robots().rules).toMatchObject({ userAgent: '*', disallow: '/' });
    });

    it('libera só a imagem de compartilhamento no robots.txt', () => {
        expect(robots().rules).toMatchObject({ allow: '/og.png' });
    });

    it('usa o domínio e o título do Kontal com modelo para as páginas', () => {
        expect(String(metadata.metadataBase)).toBe(`${SITE.url}/`);
        expect(metadata.title).toEqual({ default: 'Kontal', template: '%s | Kontal' });
    });

    it('declara a og:image e o cartão grande do Twitter com a mesma imagem', () => {
        const og = metadata.openGraph as { images: { url: string; width: number }[] };
        expect(og.images[0]).toMatchObject({ url: '/og.png', width: 1600, height: 838 });
        expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    });

    it('a imagem existe em public/, é PNG da proporção declarada e cabe em 1 MB', () => {
        const file = path.join(process.cwd(), 'public', 'og.png');
        const header = readFileSync(file).subarray(0, 24);
        expect(header.subarray(1, 4).toString('ascii')).toBe('PNG');
        expect(header.readUInt32BE(16)).toBe(SITE.ogImage.width);
        expect(header.readUInt32BE(20)).toBe(SITE.ogImage.height);
        expect(statSync(file).size).toBeLessThan(1024 * 1024);
    });
});

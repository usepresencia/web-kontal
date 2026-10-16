import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OpeningTitleForm } from './opening-title-form';

const html = renderToStaticMarkup(
    <BusyProvider>
        <OpeningTitleForm
            action={vi.fn()}
            type="INCOME"
            presets={[{ value: 'p1', label: 'Padrão' }]}
        />
    </BusyProvider>,
);

describe('OpeningTitleForm', () => {
    it('envia o título como implantação e pede a data e o valor já baixado', () => {
        expect(html).toMatch(/<input[^>]*name="isOpening"[^>]*value="true"/);
        expect(html).toContain('name="openingDate"');
        expect(html).toContain('name="settledAmount"');
    });

    it('não oferece repetição nem baixa na hora', () => {
        expect(html).not.toContain('name="repeat"');
        expect(html).not.toContain('payNow');
    });
});

import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Title } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

// O diálogo de detalhes chama uma Server Action; aqui só a marcação da lista importa.
vi.mock('@/actions/titles', () => ({ getTitleEntriesAction: vi.fn() }));

const { TransactionList } = await import('./transaction-list');
type TransactionRow = Parameters<typeof TransactionList>[0]['rows'][number];

const title = (id: string, description: string): Title => ({
    id,
    presetId: 'p',
    presetName: 'Padrão',
    partyId: 'pt1',
    partyName: 'Copel',
    seriesId: null,
    seriesIndex: null,
    type: 'EXPENSE',
    status: 'OPEN',
    description,
    amount: '10.00',
    settledAmount: '0.00',
    remainingAmount: '10.00',
    issueDate: '2026-10-01',
    expirationDate: '2026-11-01',
    feesPercentageMonthly: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
});

const rows = (count: number): TransactionRow[] =>
    Array.from({ length: count }, (_, index) => ({
        title: title(`t${index}`, `Conta ${index}`),
        ago: 'hoje',
    }));

const separators = (html: string) => (html.match(/role="separator"/g) ?? []).length;

describe('TransactionList', () => {
    it('põe um divisor com degradê e opacidade entre os itens, não depois do último', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TransactionList rows={rows(3)} />
            </BusyProvider>,
        );
        expect(separators(html)).toBe(2);
        expect(html).toContain('bg-gradient-to-r');
        expect(html).toContain('from-primary/10');
        expect(html).toContain('to-transparent');
    });

    it('começa o divisor no início do título, alinhado depois do ícone', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TransactionList rows={rows(2)} />
            </BusyProvider>,
        );
        const separator = html.match(/<div role="separator"[^>]*>/)?.[0] ?? '';
        expect(separator).toContain('ml-12');
    });

    it('afasta o divisor das linhas, para o hover não encostar nele', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TransactionList rows={rows(2)} />
            </BusyProvider>,
        );
        const separator = html.match(/<div role="separator"[^>]*>/)?.[0] ?? '';
        expect(separator).toContain('my-1');
    });

    it('mostra o ícone de pagamento no lugar das iniciais', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TransactionList rows={rows(2)} />
            </BusyProvider>,
        );
        expect(html).toContain('lucide-credit-card');
        expect(html).not.toContain('>CO<');
    });

    it('não põe divisor numa lista de um item só', () => {
        expect(
            separators(
                renderToStaticMarkup(
                    <BusyProvider>
                        <TransactionList rows={rows(1)} />
                    </BusyProvider>,
                ),
            ),
        ).toBe(0);
    });

    it('mostra o texto de apoio quando informado', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TransactionList
                    rows={[
                        { title: title('a', 'Aluguel'), ago: 'hoje', caption: 'Vence 10/11/2026' },
                    ]}
                />
            </BusyProvider>,
        );
        expect(html).toContain('Vence 10/11/2026');
    });
});

import { notFound } from 'next/navigation';
import { CssVarValue } from './_components/css-var-value';

const BRAND_COLORS = [
    { name: 'Ink', value: '--ink', className: 'bg-brand-ink text-brand-accent' },
    {
        name: 'Surface',
        value: '--surface',
        className: 'bg-brand-surface text-brand-ink border border-border',
    },
    { name: 'Accent', value: '--accent', className: 'bg-brand-accent text-brand-ink' },
    {
        name: 'Accent soft',
        value: '--accent-soft',
        className: 'bg-brand-accent-soft text-brand-ink',
    },
    { name: 'Positive', value: '--positive', className: 'bg-brand-positive text-brand-ink' },
    { name: 'Negative', value: '--negative', className: 'bg-brand-negative text-brand-ink' },
];

const SEMANTIC_COLORS = [
    ['background', 'bg-background text-foreground border border-border'],
    ['foreground', 'bg-foreground text-background'],
    ['card', 'bg-card text-card-foreground border border-border'],
    ['muted', 'bg-muted text-muted-foreground'],
    ['border', 'bg-border text-foreground'],
    ['primary', 'bg-primary text-primary-foreground'],
    ['secondary', 'bg-secondary text-secondary-foreground'],
    ['accent', 'bg-accent text-accent-foreground'],
    ['accent-soft', 'bg-accent-soft text-foreground'],
    ['positive', 'bg-positive text-positive-foreground'],
    ['negative', 'bg-negative text-negative-foreground'],
    ['sidebar', 'bg-sidebar text-sidebar-foreground'],
    ['sidebar-primary', 'bg-sidebar-primary text-sidebar-primary-foreground'],
] as const;

const RADII = [
    ['rounded-sm', '6 px'],
    ['rounded-md', '10 px'],
    ['rounded-lg', '16 px'],
] as const;

const SPACING = [
    ['w-1', '4 px'],
    ['w-2', '8 px'],
    ['w-4', '16 px'],
    ['w-6', '24 px'],
] as const;

/** Página de conferência visual do tema; só existe fora de produção. */
export default function DesignPage() {
    if (process.env.NODE_ENV === 'production') notFound();

    return (
        <main className="mx-auto max-w-5xl space-y-12 p-8">
            <header>
                <h1 className="text-3xl font-bold">Design Kontal</h1>
                <p className="text-muted-foreground mt-2">
                    Conferência dos tokens do tema. Só existe em desenvolvimento.
                </p>
            </header>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Marca</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {BRAND_COLORS.map(color => (
                        <div key={color.name} className={`rounded-lg p-4 ${color.className}`}>
                            <p className="font-semibold">{color.name}</p>
                            <p className="text-sm">
                                <CssVarValue name={color.value} />
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Tokens semânticos</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {SEMANTIC_COLORS.map(([name, className]) => (
                        <div key={name} className={`rounded-md p-4 text-sm ${className}`}>
                            {name}
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Fontes</h2>
                <p className="font-display text-3xl">Space Grotesk, títulos e marca</p>
                <p className="font-sans text-base">Inter, corpo, interface e números: 0123456789</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Raios</h2>
                <div className="flex gap-4">
                    {RADII.map(([className, label]) => (
                        <div key={className} className={`bg-primary h-16 w-16 ${className}`}>
                            <span className="sr-only">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Espaçamentos</h2>
                <div className="flex items-end gap-4">
                    {SPACING.map(([className, label]) => (
                        <div key={className} className="space-y-1 text-sm">
                            <div className={`bg-primary h-6 ${className}`} />
                            <p>{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Estados financeiros</h2>
                <p>
                    Receita <span className="text-positive font-semibold">R$ 1.234,56</span> ·
                    Despesa <span className="text-negative font-semibold">-R$ 789,00</span>
                </p>
            </section>
        </main>
    );
}

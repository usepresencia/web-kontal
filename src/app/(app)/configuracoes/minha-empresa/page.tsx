import { formatDocument } from '@/lib/_utils/document';
import { apiFetch } from '@/lib/api/client';
import { companySchema } from '@/lib/api/schemas/company';
import { CurrentCompanyDialog } from './_components/current-company-dialog';

export default async function MyCompanyPage() {
    const company = await apiFetch('/company', companySchema);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Minha empresa</h1>
                    <p className="text-muted-foreground text-sm">
                        Dados e logo da empresa selecionada
                    </p>
                </div>
                <CurrentCompanyDialog />
            </header>

            <section className="bg-card flex items-center gap-4 rounded-2xl p-5 shadow-sm">
                <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                    {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={company.logoUrl}
                            alt="Logo da empresa"
                            className="size-full object-cover"
                        />
                    ) : (
                        <span className="text-muted-foreground text-[11px]">Sem logo</span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-foreground text-base font-semibold">{company.name}</p>
                    <p className="text-muted-foreground text-sm">
                        {company.socialReason} · {formatDocument(company.cnpj)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {company.address.city}/{company.address.state} · {company.email}
                    </p>
                </div>
            </section>
        </div>
    );
}

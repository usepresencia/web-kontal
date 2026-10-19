import { apiFetch } from '@/lib/api/client';
import { companySchema } from '@/lib/api/schemas/company';
import { CurrentCompanyCard } from './_components/current-company-card';

export default async function MyCompanyPage() {
    const company = await apiFetch('/company', companySchema);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Minha empresa</h1>
                <p className="text-muted-foreground text-sm">Dados e logo da empresa selecionada</p>
            </header>

            <CurrentCompanyCard company={company} />
        </div>
    );
}

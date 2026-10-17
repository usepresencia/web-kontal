import { updateCompanyAction } from '@/actions/companies';
import { apiFetch } from '@/lib/api/client';
import { companySchema } from '@/lib/api/schemas/company';
import { CompanyForm } from '../_components/company-form';
import { LogoUpload } from '../_components/logo-upload';

export default async function CurrentCompanyPage() {
    const company = await apiFetch('/company', companySchema);

    return (
        <div className="max-w-3xl space-y-8">
            <h1 className="text-2xl font-bold">Empresa atual</h1>
            <LogoUpload logoUrl={company.logoUrl} />
            <CompanyForm
                action={updateCompanyAction}
                company={company}
                submitLabel="Salvar alterações"
            />
        </div>
    );
}

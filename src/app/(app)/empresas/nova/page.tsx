import { createCompanyAction } from '@/actions/companies';
import { CompanyForm } from '../_components/company-form';

export default function NewCompanyPage() {
    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold">Nova empresa</h1>
            <CompanyForm action={createCompanyAction} submitLabel="Cadastrar empresa" />
        </div>
    );
}

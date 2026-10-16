import { createPlanAction } from '@/actions/billing';
import { PlanForm } from '../_components/plan-form';

export default function NewPlanPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Novo plano de contas</h1>
            <PlanForm action={createPlanAction} submitLabel="Criar plano" />
        </div>
    );
}

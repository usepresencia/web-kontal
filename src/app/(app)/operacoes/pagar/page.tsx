import { TitlesView } from '../_components/titles-view';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <TitlesView
            type="EXPENSE"
            heading="Contas a pagar"
            subtitle="Gerencie suas contas a pagar"
            searchParams={await searchParams}
        />
    );
}

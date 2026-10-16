import { TitlesView } from '../_components/titles-view';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <TitlesView
            type="EXPENSE"
            basePath="/operacoes/pagar"
            heading="Contas a pagar"
            searchParams={await searchParams}
        />
    );
}

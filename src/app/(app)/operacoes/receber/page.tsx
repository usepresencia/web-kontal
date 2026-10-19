import { TitlesView } from '../_components/titles-view';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <TitlesView
            type="INCOME"
            heading="Contas a receber"
            subtitle="Gerencie suas contas a receber"
            searchParams={await searchParams}
        />
    );
}

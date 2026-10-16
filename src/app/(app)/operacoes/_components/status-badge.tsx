import { Badge } from '@/lib/_components/ui/badge';
import { TITLE_STATUS_LABELS } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';

/** Situação do título com o rótulo em português. */
export function StatusBadge({ status }: { status: Title['status'] }) {
    return (
        <Badge variant={status === 'OPEN' ? 'default' : 'secondary'}>
            {TITLE_STATUS_LABELS[status]}
        </Badge>
    );
}

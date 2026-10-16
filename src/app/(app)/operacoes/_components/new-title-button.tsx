import { Button } from '@/lib/_components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

type NewTitleButtonProps = { href: string; label: string };

/** Botão que leva ao cadastro de um novo título ("Novo pagamento" ou "Novo recebimento"), com o + antes do texto. */
export function NewTitleButton({ href, label }: NewTitleButtonProps) {
    return (
        <Button asChild>
            <Link href={href}>
                <Plus aria-hidden="true" />
                {label}
            </Link>
        </Button>
    );
}

import { Button } from '@/lib/_components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/** Botão que leva ao cadastro de um novo título, com o + antes do texto. */
export function NewTitleButton({ href }: { href: string }) {
    return (
        <Button asChild>
            <Link href={href}>
                <Plus aria-hidden="true" />
                Novo título
            </Link>
        </Button>
    );
}

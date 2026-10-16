'use client';

import { removeLogoAction, saveLogoAction, signLogoUploadAction } from '@/actions/companies';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Button } from '@/lib/_components/ui/button';
import { Input } from '@/lib/_components/ui/input';
import { useRef, useState, useTransition } from 'react';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

/** Envia o logo direto ao Cloudinary com a assinatura da api-kontal e grava a URL. */
export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Enviando logo…');
    const [message, setMessage] = useState<string | null>(null);

    const upload = (file: File) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            setMessage('Use uma imagem PNG, JPG ou WEBP.');
            return;
        }
        if (file.size > MAX_BYTES) {
            setMessage('A imagem deve ter no máximo 2 MB.');
            return;
        }

        startTransition(async () => {
            setMessage(null);
            const signed = await signLogoUploadAction();
            if (!signed) {
                setMessage('Não foi possível iniciar o envio.');
                return;
            }

            const body = new FormData();
            body.append('file', file);
            body.append('api_key', signed.apiKey);
            body.append('timestamp', String(signed.timestamp));
            body.append('public_id', signed.publicId);
            body.append('allowed_formats', signed.allowedFormats);
            body.append('overwrite', String(signed.overwrite));
            body.append('invalidate', String(signed.invalidate));
            body.append('signature', signed.signature);

            const response = await fetch(signed.uploadUrl, { method: 'POST', body });
            if (!response.ok) {
                setMessage('O envio da imagem falhou.');
                return;
            }
            const { secure_url } = (await response.json()) as { secure_url?: string };
            const result = await saveLogoAction(secure_url ?? '');
            setMessage(
                result.ok ? 'Logo atualizado.' : (result.message ?? 'Não foi possível salvar.'),
            );
        });
    };

    const remove = () =>
        startTransition(async () => {
            const result = await removeLogoAction();
            setMessage(
                result.ok ? 'Logo removido.' : (result.message ?? 'Não foi possível remover.'),
            );
        });

    return (
        <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Logo</h2>
            {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={logoUrl}
                    alt="Logo da empresa"
                    className="border-border h-20 rounded-md border"
                />
            ) : (
                <p className="text-muted-foreground text-sm">Nenhum logo enviado.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    disabled={pending}
                    aria-label="Escolher logo"
                    className="max-w-xs"
                    onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) upload(file);
                        if (inputRef.current) inputRef.current.value = '';
                    }}
                />
                {logoUrl && (
                    <Button type="button" variant="outline" disabled={pending} onClick={remove}>
                        Remover logo
                    </Button>
                )}
            </div>
            {message && (
                <p role="status" className="text-muted-foreground text-sm">
                    {message}
                </p>
            )}
        </div>
    );
}

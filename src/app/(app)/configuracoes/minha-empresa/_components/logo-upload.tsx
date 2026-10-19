'use client';

import { removeLogoAction, saveLogoAction, signLogoUploadAction } from '@/actions/companies';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Button } from '@/lib/_components/ui/button';
import { notify, notifyResult } from '@/lib/_utils/notify';
import { useRef, useTransition } from 'react';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

const LOGO_UPDATED = { title: 'Logo atualizado', message: 'O logo foi atualizado com sucesso.' };
const LOGO_REMOVED = { title: 'Logo removido', message: 'O logo foi removido com sucesso.' };

/** Envia o logo direto ao Cloudinary com a assinatura da api-kontal e grava a URL; o resultado vem em toast. */
export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Enviando logo…');

    const upload = (file: File) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            notify('error', 'Use uma imagem PNG, JPG ou WEBP.');
            return;
        }
        if (file.size > MAX_BYTES) {
            notify('error', 'A imagem deve ter no máximo 2 MB.');
            return;
        }

        startTransition(async () => {
            const signed = await signLogoUploadAction();
            if (!signed) {
                notify('error', 'Não foi possível iniciar o envio.');
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
                notify('error', 'O envio da imagem falhou.');
                return;
            }
            const { secure_url } = (await response.json()) as { secure_url?: string };
            const result = await saveLogoAction(secure_url ?? '');
            notifyResult(result, LOGO_UPDATED, 'Não foi possível salvar.');
        });
    };

    const remove = () =>
        startTransition(async () => {
            const result = await removeLogoAction();
            notifyResult(result, LOGO_REMOVED, 'Não foi possível remover.');
        });

    return (
        <div className="flex items-center gap-4 pl-4">
            <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo da empresa" className="size-full object-cover" />
                ) : (
                    <span className="text-muted-foreground text-[11px]">Sem logo</span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    disabled={pending}
                    aria-label="Escolher logo"
                    className="sr-only"
                    onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) upload(file);
                        if (inputRef.current) inputRef.current.value = '';
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-6"
                    disabled={pending}
                    onClick={() => inputRef.current?.click()}
                >
                    {logoUrl ? 'Trocar logo' : 'Enviar logo'}
                </Button>
                {logoUrl && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-6"
                        disabled={pending}
                        onClick={remove}
                    >
                        Remover logo
                    </Button>
                )}
            </div>
        </div>
    );
}

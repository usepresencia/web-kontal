import type { ZodError } from 'zod';

/** Resultado de uma Server Action de formulário. */
export type FormState = {
    ok: boolean;
    message?: string;
    fieldErrors?: Record<string, string[]>;
};

export const INITIAL_FORM_STATE: FormState = { ok: false };

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Converte o FormData em objeto; chaves com ponto viram objetos aninhados e arquivos são descartados. */
export function formDataToObject(data: FormData): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of data.entries()) {
        if (key.startsWith('$ACTION') || typeof value !== 'string') continue;
        const path = key.split('.');
        if (path.some(part => FORBIDDEN_KEYS.has(part))) continue;

        let target = result;
        path.slice(0, -1).forEach(part => {
            const next = target[part];
            target[part] = typeof next === 'object' && next !== null ? next : Object.create(null);
            target = target[part] as Record<string, unknown>;
        });
        target[path[path.length - 1]] = value;
    }

    return JSON.parse(JSON.stringify(result));
}

/** Converte um erro do zod em estado de formulário, com as mensagens por caminho do campo. */
export function stateFromZodError(error: ZodError): FormState {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
        const path = issue.path.join('.') || '_';
        (fieldErrors[path] ??= []).push(issue.message);
    }
    return { ok: false, fieldErrors };
}

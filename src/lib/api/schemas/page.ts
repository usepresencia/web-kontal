import { z } from 'zod';

/** Schema do envelope de listagem da api-kontal para o schema de item informado. */
export function pageSchema<T extends z.ZodType>(item: T) {
    return z.object({
        items: z.array(item),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
        total: z.number().int().nonnegative(),
    });
}

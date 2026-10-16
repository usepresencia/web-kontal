import { z } from 'zod';

export const tenantSchema = z.object({
    companyId: z.string(),
    name: z.string(),
    role: z.string(),
    isActive: z.boolean(),
});

export const tenantsSchema = z.array(tenantSchema);

export type Tenant = z.infer<typeof tenantSchema>;

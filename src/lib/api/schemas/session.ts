import { z } from 'zod';

export const meSchema = z.object({
    id: z.string(),
    firebaseUid: z.string(),
    email: z.string(),
    name: z.string(),
    isPlatformUser: z.boolean(),
    platformRole: z.string().nullable(),
});

export type Me = z.infer<typeof meSchema>;

export const sessionSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        avatarUrl: z.string().nullable(),
        phone: z.string().nullable(),
    }),
    isPlatformUser: z.boolean(),
    platformRole: z.string().nullable(),
    memberships: z.array(
        z.object({
            companyId: z.string(),
            companyName: z.string(),
            role: z.string(),
            isActive: z.boolean(),
        }),
    ),
});

export type SessionBootstrap = z.infer<typeof sessionSchema>;
